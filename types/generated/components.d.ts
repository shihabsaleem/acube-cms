import type { Schema, Struct } from '@strapi/strapi';

export interface SharedButton extends Struct.ComponentSchema {
  collectionName: 'components_shared_buttons';
  info: {
    displayName: 'Button';
  };
  attributes: {
    href: Schema.Attribute.String;
    label: Schema.Attribute.String;
  };
}

export interface SharedHeroStat extends Struct.ComponentSchema {
  collectionName: 'components_shared_hero_stats';
  info: {
    displayName: 'Hero Stat';
  };
  attributes: {
    label1: Schema.Attribute.String;
    label2: Schema.Attribute.String;
    number: Schema.Attribute.String;
  };
}

export interface SharedOffice extends Struct.ComponentSchema {
  collectionName: 'components_shared_offices';
  info: {
    displayName: 'Office';
  };
  attributes: {
    address: Schema.Attribute.Text;
    addressLines: Schema.Attribute.JSON;
    title: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'shared.button': SharedButton;
      'shared.hero-stat': SharedHeroStat;
      'shared.office': SharedOffice;
    }
  }
}
