import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Lead } from '../models/lead.model';
import { Task } from '../models/task.model';
import { asyncHandler } from '../utils/asyncHandler';

/**
 * Controller fetches all dashboard analytics (KPIs, stage breakdown,
 * deals trend, and recent leads) using a unified MongoDB Aggregation pipeline.
 */
export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
  const ownerId = new mongoose.Types.ObjectId(req.user!.id);

  // Execute single-trip multi-facet aggregation for Lead stats
  const leadStats = await Lead.aggregate([
    { $match: { ownerId } },
    {
      $facet: {
        // Pipeline 1: KPI aggregates
        kpis: [
          {
            $group: {
              _id: null,
              totalLeads: { $sum: 1 },
              totalPipelineValue: {
                $sum: { $cond: [{ $ne: ['$stage', 'lost'] }, '$value', 0] },
              },
              wonDealsValue: {
                $sum: { $cond: [{ $eq: ['$stage', 'won'] }, '$value', 0] },
              },
              wonCount: {
                $sum: { $cond: [{ $eq: ['$stage', 'won'] }, 1, 0] },
              },
              lostCount: {
                $sum: { $cond: [{ $eq: ['$stage', 'lost'] }, 1, 0] },
              },
            },
          },
        ],
        // Pipeline 2: Leads grouped by stage
        stageBreakdown: [
          {
            $group: {
              _id: '$stage',
              count: { $sum: 1 },
              totalValue: { $sum: '$value' },
            },
          },
        ],
        // Pipeline 3: Group deals by creation month (Past 6 months trend)
        dealsTrend: [
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
              value: { $sum: '$value' },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
          { $limit: 6 },
        ],
        // Pipeline 4: Extract last 5 leads
        recentLeads: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $project: {
              name: 1,
              value: 1,
              stage: 1,
              contactId: 1,
              createdAt: 1,
            },
          },
        ],
      },
    },
  ]);

  const facetResult = leadStats[0] || {};
  const kpiStats = facetResult.kpis?.[0] || {
    totalLeads: 0,
    totalPipelineValue: 0,
    wonDealsValue: 0,
    wonCount: 0,
    lostCount: 0,
  };

  // Calculate conversion rates
  const won = kpiStats.wonCount;
  const lost = kpiStats.lostCount;
  const totalClosed = won + lost;
  const conversionRate = totalClosed > 0 ? Math.round((won / totalClosed) * 100) : 0;

  // Retrieve active tasks count (tasks excluding 'completed' status)
  const activeTasksCount = await Task.countDocuments({
    ownerId,
    status: { $ne: 'completed' },
  });

  // Populate contact details for the recent leads section
  let recentLeads = facetResult.recentLeads || [];
  if (recentLeads.length > 0) {
    recentLeads = await Lead.populate(recentLeads, {
      path: 'contactId',
      select: 'name email company',
    });
  }

  res.status(200).json({
    success: true,
    data: {
      kpis: {
        totalLeads: kpiStats.totalLeads,
        totalPipelineValue: kpiStats.totalPipelineValue,
        wonDealsValue: kpiStats.wonDealsValue,
        conversionRate,
        activeTasksCount,
      },
      stageBreakdown: facetResult.stageBreakdown || [],
      dealsTrend: facetResult.dealsTrend || [],
      recentLeads,
    },
  });
});
