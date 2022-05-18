import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root',
})
export class StreamlinerService {
    constructor(private toastr: ToastrService) {}

    public cleanupContent(fileContent: string): string {
        let fileContentWithoutBlanks = this.removeBlankLines(fileContent);
        let warningHeader = "File was changed during upload";
        if (fileContentWithoutBlanks !== fileContent) {
            this.toastr.warning(
                `Blank lines removed`,
                warningHeader
            );
        }
        let fileContentWithoutDuplicates = this.removeDuplicateLines(fileContentWithoutBlanks);
        if (fileContentWithoutDuplicates !== fileContentWithoutBlanks) {
            this.toastr.warning(
                `Duplicate lines removed`,
                warningHeader
            );
        }
       /* let fileContentWithoutInvalidArcs = this.removeInvalidArcs(fileContentWithoutDuplicates);
        if (fileContentWithoutInvalidArcs !== fileContentWithoutDuplicates) {
            this.toastr.warning(
                `Invalid Arcs Removed`,
                warningHeader
            );
        }*/
        return fileContentWithoutDuplicates;
    }

    private removeBlankLines(fileContent: string): string {
        return fileContent.replace(/^\s*\n/gm, "");
    }

    private removeDuplicateLines(fileContent: string): string {
        return fileContent.split("\n").filter((line, i, allLines) => {
            return i === allLines.indexOf(line);
        }).join("\n");
    }

    private removeInvalidArcs(fileContent: string): string {
        let lineArray = fileContent.split("\n");
        let beginningOfArcs = lineArray.indexOf(".arcs") + 1;
        let firstLines = beginningOfArcs > -1 ? lineArray.slice(0, beginningOfArcs) : [];
        let arcs = lineArray.slice(beginningOfArcs);
        let validArcs = arcs.filter(this.isValidArc(firstLines));
        return firstLines.join("\n") + "\n" + validArcs.join("\n");
    }

    private isValidArc(transitions: string[]) {
        return function(arc: string): boolean {
            let arcElements = arc.split(" ");
            if (arcElements.length !== 2) {
                return false;
            }
            if (arcElements[0] === arcElements[1]) {
                return false;
            }
            if (transitions.indexOf(arcElements[0]) === -1) {
                return false;
            }
            return transitions.indexOf(arcElements[1]) !== -1;
        }
    }
}
