'use strict';

/**
 * customer controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::customer.customer', ({ strapi }) => ({
  async create(ctx) {
    const { email, ...restData } = ctx.request.body.data;

    // Check if a customer with this email already exists
    const existingCustomer = await strapi.entityService.findMany('api::customer.customer', {
      filters: { email },
      limit: 1,
    });

    if (existingCustomer.length > 0) {
      // Customer already exists, return the existing customer
      return ctx.send({
        message: 'Customer with this email already exists.',
        customer: existingCustomer[0],
      }, 200);
    }

    // No existing customer found, proceed with creation
    const response = await super.create(ctx);
    return response;
  },
}));
