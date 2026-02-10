import { SITE_GENERATION_TYPES } from "../constants";
import { SiteConfig } from "../interfaces/siteConfig";
import { SiteGenerationData } from "../interfaces/siteGenerationData";
import { caveGenerator } from "./siteGenerator_cave";
import { templeGenerator } from "./siteGenerator_temple";

export interface SiteGenerator {
    generateSite(siteConfig: SiteConfig, instanceWidth: number, instanceHeight: number): SiteGenerationData;
}

export const GeneratorMapping: {[key in SITE_GENERATION_TYPES]: SiteGenerator} = {
    [SITE_GENERATION_TYPES.cave]: caveGenerator,
    [SITE_GENERATION_TYPES.temple]: templeGenerator
};