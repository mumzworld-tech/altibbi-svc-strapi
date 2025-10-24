"use strict";

/**
 * booking controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::booking.booking", ({ strapi }) => ({
  async create(ctx) {
    try {
      // Generate order ID with retry logic
      const generateUniqueOrderId = async (attempts = 0) => {
        if (attempts > 3) {
          throw new Error(
            "Failed to generate unique order ID after 3 attempts"
          );
        }

        // Using findOne in Strapi v5
        const lastOrder = await strapi.entityService.findMany(
          "api::booking.booking",
          {
            sort: { id: "desc" },
            fields: ["orderId"],
            limit: 1,
          }
        );

        let orderId;
        if (lastOrder.length > 0 && lastOrder[0].orderId?.startsWith("FH-")) {
          const lastOrderId = lastOrder[0].orderId.split("-")[1];
          orderId = `FH-${parseInt(lastOrderId) + 1}`;
        } else {
          orderId = `FH-915100`;
        }

        // inject relation before calling super
        ctx.request.body.data.orderId = orderId;

        try {
          const response = await super.create(ctx);
          return response;
        } catch (error) {
          if (
            error.message.includes("unique") ||
            error.message.includes("duplicate")
          ) {
            // Retry with new ID
            return await generateUniqueOrderId(attempts + 1);
          }
          throw error;
        }
      };

      const data = await generateUniqueOrderId();

      return data;
    } catch (error) {
      console.error("Error creating service-request:", error);
      ctx.throw(500, "Failed to create service-request");
    }
  },
}));
