import { MapArea } from "../interfaces/mapArea";
import { SiteConfig } from "../interfaces/siteConfig";
import { DustModel } from "./dustModel";

export interface SiteGenerator {
    generateSite(siteConfig: SiteConfig, instanceWidth: number, instanceHeight: number): {tileIndexData: number[][], areaData: MapArea[], dustData: DustModel[]};
}