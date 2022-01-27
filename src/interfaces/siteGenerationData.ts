import { SITE_TYPES } from "../constants";
import { DustModel } from "../siteGenerator/dustModel";
import MapArea from "./mapArea";

export interface SiteGenerationData {
    tileIndexData: number[][],
    areas: MapArea[],
    dust: DustModel[],
    siteType: SITE_TYPES,
    siteConfigName: string,
    siteWidth: number,
    siteHeight: number,
}