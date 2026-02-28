import type { GlobalConfig } from "payload";

export const HomePage: GlobalConfig = {
  slug: "home-page",
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      defaultValue: "Home",
      localized: true,
    },
    {
      name: "page",
      type: "relationship",
      relationTo: "pages",
      required: true,
      admin: {
        description: "Select the Page document to render as the homepage.",
      },
    },
  ],
};
