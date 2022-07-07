import { XMLParser } from 'fast-xml-parser';

export function getRunTextFromPnml(xmlContent: string): string {
    const data = new XMLParser().parse(xmlContent);

    return '';
}
