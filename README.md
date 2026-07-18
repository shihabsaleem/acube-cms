# Acube CMS

This is a [Strapi](https://strapi.io) application that serves as the backend Content Management System (CMS) for the Acube platform. It manages dynamic content like pages, services, testimonials, and site-wide global settings.

## 🚀 Getting Started

Strapi comes with a full-featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) to scaffold and manage the project.

### Prerequisites
- Node.js (>=20.0.0 <=26.x.x)
- NPM or Yarn

### Installation

```bash
npm install
```

### Development

Start your Strapi application with autoReload enabled.

```bash
npm run develop
# or
yarn develop
```

### Production Start

Start your Strapi application with autoReload disabled.

```bash
npm run start
# or
yarn start
```

### Build

Build the admin panel UI.

```bash
npm run build
# or
yarn build
```

## 🏗️ Architecture & Content Types

The CMS is structured using Strapi's Collection Types, Single Types, and Components to organize content effectively.

### Collection Types
These models are used for content that has multiple entries.
- **Service**: Manages the various services offered.
- **Testimonial**: Client reviews and testimonials.
- **Gallery**: Media and image galleries.
- **Impact Stat**: Statistics showcasing the company's impact or metrics.

### Single Types
These models are used for pages or settings that only have one instance.
- **Home Page**: Content for the main landing page.
- **About**: Content for the About Us page.
- **Legal Page**: Content for privacy policies, terms, and conditions.
- **Global**: Site-wide configuration, such as navigation, footer information, and global SEO settings.

### Components
Reusable data structures shared across multiple content types (found in `src/components/shared`).
- **Button**: Defines CTA links, labels, and styles.
- **Hero Stat**: Defines specific statistics used in hero sections.
- **Office**: Defines office locations and contact details.

## ⚙️ Plugins & Integrations

- **Cloudinary**: Configured via `@strapi/provider-upload-cloudinary` for cloud-based media and asset management.
- **Users Permissions**: Strapi's default `@strapi/plugin-users-permissions` for handling JWT authentication and role-based access control.

## 📦 Deployment

This project is configured for containerized deployment on **Suga.app**. The `Dockerfile` has been optimized with a multi-stage build to ensure the memory-intensive Admin UI build step occurs safely without exhausting Suga's 256 MiB RAM limit.

**To deploy:**
1. Log into [Suga.app](https://suga.app/).
2. Create a new project and link this repository.
3. Configure your Environment Variables (copy from your `.env`).
4. Suga will automatically detect the `Dockerfile` and build/deploy your application.

## 📚 Learn More

- [Strapi Documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi Forums](https://forum.strapi.io/) - Discuss and get help from the community.
