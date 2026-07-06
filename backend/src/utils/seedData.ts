import { faker } from '@faker-js/faker';
import { Lead } from '../models/lead.model';
import { Contact } from '../models/contact.model';
import { Task } from '../models/task.model';

export const seedDemoData = async (user: any) => {
  try {
    // Clear existing data for the user
    await Lead.deleteMany({ ownerId: user._id });
    await Contact.deleteMany({ ownerId: user._id });
    await Task.deleteMany({ ownerId: user._id });

    // Create Contacts
    const contacts = [];
    for (let i = 0; i < 5; i++) {
      contacts.push({
        ownerId: user._id,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        company: faker.company.name(),
      });
    }
    const createdContacts = await Contact.insertMany(contacts);

    // Create Leads
    const leads = [];
    for (let i = 0; i < 10; i++) {
      leads.push({
        ownerId: user._id,
        name: faker.company.name(),
        value: faker.number.int({ min: 1000, max: 100000 }),
        stage: faker.helpers.arrayElement(['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost']),
        contactId: createdContacts[faker.number.int({ min: 0, max: createdContacts.length - 1 })]._id,
      });
    }
    const createdLeads = await Lead.insertMany(leads);

    // Create Tasks
    const tasks = [];
    for (let i = 0; i < 15; i++) {
      tasks.push({
        ownerId: user._id,
        title: faker.lorem.sentence(),
        description: faker.lorem.paragraph(),
        status: faker.helpers.arrayElement(['pending', 'in-progress', 'completed']),
        dueDate: faker.helpers.arrayElement([
          faker.date.past({ years: 1 }),
          faker.date.soon({ days: 30 }),
          faker.date.future({ years: 1 }),
        ]),
        leadId: createdLeads[faker.number.int({ min: 0, max: createdLeads.length - 1 })]._id,
      });
    }
    await Task.insertMany(tasks);

    console.log('Demo data seeded successfully for user:', user.email);
  } catch (error) {
    console.error('Error seeding demo data:', error);
  }
};
