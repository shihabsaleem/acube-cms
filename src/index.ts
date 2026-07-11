import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';

// Helper: convert data.json legacy content array to Strapi 5 Blocks format
function toStrapiBlocks(content: any[]): any[] {
  return content.map((section: any) => {
    if (section.type === 'heading') {
      return {
        type: 'heading',
        level: 2,
        children: [{ type: 'text', text: section.text }],
      };
    }
    if (section.type === 'paragraph' || section.type === 'address') {
      return {
        type: 'paragraph',
        children: [{ type: 'text', text: section.text }],
      };
    }
    if (section.type === 'list') {
      return {
        type: 'list',
        format: 'unordered',
        children: (section.items || []).map((item: string) => ({
          type: 'list-item',
          children: [{ type: 'text', text: item }],
        })),
      };
    }
    // fallback
    return {
      type: 'paragraph',
      children: [{ type: 'text', text: section.text || '' }],
    };
  });
}

export default {
  register(/* { strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      const cwd = process.cwd();
      const resolvedPath = path.resolve(cwd, '../acube/app/data.json');

      if (!fs.existsSync(resolvedPath)) {
        strapi.log.warn(`Seed data not found at ${resolvedPath}`);
        return;
      }

      const rawData = fs.readFileSync(resolvedPath, 'utf-8');
      const data = JSON.parse(rawData);

      // Helper: check if a collection is empty
      const isEmpty = async (uid: any) => {
        const count = await strapi.db.query(uid).count();
        return count === 0;
      };

      // ──────────────────────────────────────────────
      // 1. GLOBAL SINGLE TYPE
      // Schema fields: siteUrl, metaTitle, metaDescription, email,
      //   phoneDisplay, phoneLink, phone2Display, phone2Link,
      //   navTiming, companyInfo, offices (component: shared.office)
      // ──────────────────────────────────────────────
      if (await isEmpty('api::global.global')) {
        await strapi.documents('api::global.global').create({
          data: {
            siteUrl:         data.config.siteUrl,
            metaTitle:       data.metadata.title,
            metaDescription: data.metadata.description,
            email:           data.company.email,
            phoneDisplay:    data.company.phones[0]?.display || '',
            phoneLink:       data.company.phones[0]?.link || '',
            phone2Display:   data.company.phones[1]?.display || '',
            phone2Link:      data.company.phones[1]?.link || '',
            navTiming:       data.navbar.timings,
            companyInfo:     data.footer.companyInfo,
            offices: Object.values(data.company.offices).map((office: any) => ({
              title:        office.title,
              address:      office.address,
              addressLines: office.addressLines.join('\n'),
            })),
          },
          status: 'published',
        });
        strapi.log.info('✅ Seeded Global configuration.');
      } else {
        strapi.log.info('⏭  Global already seeded, skipping.');
      }

      // ──────────────────────────────────────────────
      // 2. HOME PAGE SINGLE TYPE
      // Schema fields: heroBadge, heroTitle1, heroTitle2, heroHighlight,
      //   heroDescription, heroTags, heroButton1 (component), heroButton2 (component),
      //   heroStats (repeatable component: shared.hero-stat),
      //   impactBadge, impactTitle, impactDescription,
      //   serviceBadge, serviceTitle1, serviceTitle2, serviceHighlight, serviceTitle3
      //
      // NOTE: clients section fields (clientBadge, clientTitle, etc.) are in data.json
      //   but NOT yet in the home-page schema. They fall back to data.json on the frontend.
      //   Add those fields to the schema to enable CMS control.
      // ──────────────────────────────────────────────
      if (await isEmpty('api::home-page.home-page')) {
        await strapi.documents('api::home-page.home-page').create({
          data: {
            heroBadge:       data.hero.badge,
            heroTitle1:      data.hero.titlePart1,
            heroTitle2:      data.hero.titlePart2,
            heroHighlight:   data.hero.titleHighlight,
            heroDescription: data.hero.description,
            heroTags:        data.hero.tags.join(', '),
            heroButton1:     { label: data.hero.button1.label, href: data.hero.button1.href },
            heroButton2:     { label: data.hero.button2.label, href: data.hero.button2.href },
            heroStats:       data.hero.stats.map((stat: any) => ({
              number: stat.number,
              label1: stat.label1,
              label2: stat.label2 || '',
            })),
            impactBadge:        data.impacts.badge,
            impactTitle:        data.impacts.title,
            impactDescription:  data.impacts.description,
            serviceBadge:       data.services.badge,
            serviceTitle1:      data.services.titlePart1,
            serviceTitle2:      data.services.titlePart2,
            serviceHighlight:   data.services.titleHighlight,
            serviceTitle3:      data.services.titlePart3,
          },
          status: 'published',
        });
        strapi.log.info('✅ Seeded Home Page.');
      } else {
        strapi.log.info('⏭  Home Page already seeded, skipping.');
      }

      // ──────────────────────────────────────────────
      // 3. ABOUT SINGLE TYPE
      // Schema fields: heroBadge, heroTitle, heroHighlight, heroDescription (blocks),
      //   heroImage (media - skipped, upload manually),
      //   floatingBadgeTitle, floatingBadgeSubtitle,
      //   visionTitle, visionDescription, missionTitle, missionDescription,
      //   leaderName, leaderTitle, leaderBio, leaderQuote,
      //   leaderImage (media - skipped, upload manually)
      //
      // NOTE: The frontend AboutClient.tsx reads leadershipBadge, leadershipHeadline1,
      //   leadershipHighlight from props but those fields don't exist in the schema.
      //   The seed uses leaderName/leaderTitle/leaderBio/leaderQuote per the actual schema.
      // ──────────────────────────────────────────────
      if (await isEmpty('api::about.about')) {
        await strapi.documents('api::about.about').create({
          data: {
            heroBadge:           data.about.hero.badge,
            heroTitle:           data.about.hero.titlePart1,
            heroHighlight:       data.about.hero.titleHighlight,
            heroDescription:     data.about.hero.description.map((para: string) => ({
              type: 'paragraph',
              children: [{ type: 'text', text: para }],
            })),
            floatingBadgeTitle:    data.about.hero.floatingBadge.title,
            floatingBadgeSubtitle: data.about.hero.floatingBadge.subtitle,
            visionTitle:           data.about.vision.title,
            visionDescription:     data.about.vision.description,
            missionTitle:          data.about.mission.title,
            missionDescription:    data.about.mission.description,
            leaderName:            data.about.leadership.name,
            leaderTitle:           data.about.leadership.title,
            leaderBio:             data.about.leadership.bio,
            leaderQuote:           data.about.leadership.quote,
          },
          status: 'published',
        });
        strapi.log.info('✅ Seeded About Page.');
      } else {
        strapi.log.info('⏭  About Page already seeded, skipping.');
      }

      // ──────────────────────────────────────────────
      // 4. SERVICES COLLECTION TYPE
      // Schema fields: textLine1, textLine2, description, items (text, newline-separated)
      // ──────────────────────────────────────────────
      if (await isEmpty('api::service.service')) {
        for (const service of data.services.servicesData) {
          await strapi.documents('api::service.service').create({
            data: {
              textLine1:   service.titleLine1,
              textLine2:   service.titleLine2,
              description: service.desc,
              items:       service.items.join('\n'),
            },
            status: 'published',
          });
        }
        strapi.log.info('✅ Seeded Services.');
      } else {
        strapi.log.info('⏭  Services already seeded, skipping.');
      }

      // ──────────────────────────────────────────────
      // 5. TESTIMONIALS COLLECTION TYPE
      // Schema fields: text, author
      // ──────────────────────────────────────────────
      if (await isEmpty('api::testimonial.testimonial')) {
        for (const testimonial of data.clients.testimonials) {
          await strapi.documents('api::testimonial.testimonial').create({
            data: {
              text:   testimonial.text,
              author: testimonial.author,
            },
            status: 'published',
          });
        }
        strapi.log.info('✅ Seeded Testimonials.');
      } else {
        strapi.log.info('⏭  Testimonials already seeded, skipping.');
      }

      // ──────────────────────────────────────────────
      // 6. IMPACT STATS COLLECTION TYPE
      // Schema fields: number, labelLine1, labelLine2
      // ──────────────────────────────────────────────
      if (await isEmpty('api::impact-stat.impact-stat')) {
        for (const stat of data.impacts.stats) {
          await strapi.documents('api::impact-stat.impact-stat').create({
            data: {
              number:     stat.number,
              labelLine1: stat.labelLine1,
              labelLine2: stat.labelLine2,
            },
            status: 'published',
          });
        }
        strapi.log.info('✅ Seeded Impact Stats.');
      } else {
        strapi.log.info('⏭  Impact Stats already seeded, skipping.');
      }

      // ──────────────────────────────────────────────
      // 7. LEGAL PAGES COLLECTION TYPE  (NEW)
      // Schema fields: title, slug, lastUpdated, content (blocks)
      // Seeding: Privacy Policy, Terms of Service, Disclaimer
      // ──────────────────────────────────────────────
      if (await isEmpty('api::legal-page.legal-page')) {
        const legalPages = [
          {
            title:       data.legal.privacy.title,
            slug:        'privacy-policy',
            lastUpdated: data.legal.privacy.lastUpdated,
            content:     toStrapiBlocks(data.legal.privacy.content),
          },
          {
            title:       data.legal.terms.title,
            slug:        'terms-conditions',
            lastUpdated: data.legal.terms.lastUpdated,
            content:     toStrapiBlocks(data.legal.terms.content),
          },
          {
            title:       data.legal.disclaimer.title,
            slug:        'disclaimer',
            lastUpdated: data.legal.disclaimer.lastUpdated,
            content:     toStrapiBlocks(data.legal.disclaimer.content),
          },
        ];

        for (const page of legalPages) {
          await strapi.documents('api::legal-page.legal-page').create({
            data: page,
            status: 'published',
          });
        }
        strapi.log.info('✅ Seeded Legal Pages (Privacy, Terms, Disclaimer).');
      } else {
        strapi.log.info('⏭  Legal Pages already seeded, skipping.');
      }

      // ──────────────────────────────────────────────
      // NOTE: Gallery images are NOT seeded here because they require
      // actual media file uploads. Please upload images manually in the
      // Strapi Admin > Media Library, then create Gallery entries in
      // Content Manager > Gallery with the span values below:
      //
      //   hero.png        → md:col-span-2 md:row-span-2 lg:col-span-2 lg:row-span-2
      //   hero-1.png      → md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1
      //   hero-2.png      → md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1
      //   hero-4.png      → md:col-span-1 md:row-span-2 lg:col-span-1 lg:row-span-2
      //   0hero.png       → md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1
      //   1hero.png       → md:col-span-1 md:row-span-1 lg:col-span-1 lg:row-span-1
      // ──────────────────────────────────────────────

      strapi.log.info('🎉 Seed complete.');
    } catch (err) {
      strapi.log.error('❌ Failed to seed data:', err);
    }
  },
};
