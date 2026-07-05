import { Request, Response, NextFunction } from 'express';
import { Model, Document, PopulateOptions, Types } from 'mongoose';
import asyncHandler from '../utils/asyncHandler';
import AppError from '../utils/AppError';
import APIFeatures from '../utils/apiFeatures';
import { IBaseDocument } from '../types/base.document';

export const deleteOne = <T extends IBaseDocument>(Model: Model<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findOneAndDelete({
      _id: req.params.id,
      ownerId: req.user!._id,
    } as { _id: string; ownerId: Types.ObjectId }); // Explicitly type the filter object

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

export const updateOne = <T extends IBaseDocument>(Model: Model<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const doc = await Model.findOneAndUpdate(
      {
        _id: req.params.id,
        ownerId: req.user!._id,
      } as { _id: string; ownerId: Types.ObjectId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

export const createOne = <T extends IBaseDocument>(Model: Model<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Add ownerId from the protect middleware
    req.body.ownerId = req.user!._id; // req.user._id is already Types.ObjectId
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

export const getOne = <T extends IBaseDocument>(Model: Model<T>, popOptions?: PopulateOptions | (string | PopulateOptions)[]) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    let query = Model.findOne({
      _id: req.params.id,
      ownerId: req.user!._id,
    } as { _id: string; ownerId: Types.ObjectId });
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });

export const getAll = <T extends IBaseDocument>(Model: Model<T>) =>
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Enforce multi-tenancy by adding ownerId to the filter
    const features = new APIFeatures(Model.find({ ownerId: req.user!._id } as { ownerId: Types.ObjectId }), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const docs = await features.query;

    res.status(200).json({
      status: 'success',
      results: docs.length,
      data: {
        data: docs,
      },
    });
  });