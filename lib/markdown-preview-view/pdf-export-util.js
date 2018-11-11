"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webview_handler_1 = require("./webview-handler");
const util_1 = require("../util");
const renderer_1 = require("../renderer");
const fs_1 = require("fs");
async function saveAsPDF(text, filePath, renderLaTeX, saveFilePath) {
    const view = new webview_handler_1.WebviewHandler(async () => {
        const opts = util_1.atomConfig().saveConfig.saveToPDFOptions;
        const customPageSize = parsePageSize(opts.customPageSize);
        const pageSize = opts.pageSize === 'Custom' ? customPageSize : opts.pageSize;
        if (pageSize === undefined) {
            throw new Error(`Failed to parse custom page size: ${opts.customPageSize}`);
        }
        const selection = await view.getSelection();
        const printSelectionOnly = selection ? opts.printSelectionOnly : false;
        const newOpts = Object.assign({}, opts, { pageSize,
            printSelectionOnly });
        const [width, height] = getPageWidth(newOpts.pageSize);
        view.init({
            atomHome: atom.getConfigDirPath(),
            mathJaxConfig: Object.assign({}, util_1.atomConfig().mathConfig),
            context: 'pdf-export',
            pdfExportOptions: { width: newOpts.landscape ? height : width },
        });
        view.setBasePath(filePath);
        const domDocument = await renderer_1.render({
            text,
            filePath,
            renderLaTeX,
            mode: 'copy',
        });
        await view.update(domDocument.documentElement.outerHTML, renderLaTeX);
        try {
            const data = await view.printToPDF(newOpts);
            await new Promise((resolve, reject) => {
                fs_1.writeFile(saveFilePath, data, (error) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    resolve();
                });
            });
        }
        catch (e) {
            const error = e;
            atom.notifications.addError('Failed saving to PDF', {
                description: error.toString(),
                dismissable: true,
                stack: error.stack,
            });
        }
        view.destroy();
    });
    view.element.style.pointerEvents = 'none';
    view.element.style.position = 'absolute';
    view.element.style.width = '0px';
    view.element.style.height = '0px';
    const ws = atom.views.getView(atom.workspace);
    ws.appendChild(view.element);
}
exports.saveAsPDF = saveAsPDF;
function parsePageSize(size) {
    if (!size)
        return undefined;
    const rx = /^([\d.,]+)(cm|mm|in)?x([\d.,]+)(cm|mm|in)?$/i;
    const res = size.replace(/\s*/g, '').match(rx);
    if (res) {
        const width = parseFloat(res[1]);
        const wunit = res[2];
        const height = parseFloat(res[3]);
        const hunit = res[4];
        return {
            width: convert(width, wunit),
            height: convert(height, hunit),
        };
    }
    else {
        return undefined;
    }
}
function convert(val, unit) {
    return val * unitInMicrons(unit);
}
function unitInMicrons(unit = 'mm') {
    switch (unit) {
        case 'mm':
            return 1000;
        case 'cm':
            return 10000;
        case 'in':
            return 25400;
    }
}
function getPageWidth(pageSize) {
    switch (pageSize) {
        case 'A3':
            return [297, 420];
        case 'A4':
            return [210, 297];
        case 'A5':
            return [148, 210];
        case 'Legal':
            return [216, 356];
        case 'Letter':
            return [216, 279];
        case 'Tabloid':
            return [279, 432];
        default:
            return [pageSize.width / 1000, pageSize.height / 1000];
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGRmLWV4cG9ydC11dGlsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21hcmtkb3duLXByZXZpZXctdmlldy9wZGYtZXhwb3J0LXV0aWwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSx1REFBa0Q7QUFDbEQsa0NBQW9DO0FBQ3BDLDBDQUFvQztBQUNwQywyQkFBOEI7QUFHdkIsS0FBSyxVQUFVLFNBQVMsQ0FDN0IsSUFBWSxFQUNaLFFBQTRCLEVBQzVCLFdBQW9CLEVBQ3BCLFlBQW9CO0lBRXBCLE1BQU0sSUFBSSxHQUFHLElBQUksZ0NBQWMsQ0FBQyxLQUFLLElBQUksRUFBRTtRQUN6QyxNQUFNLElBQUksR0FBRyxpQkFBVSxFQUFFLENBQUMsVUFBVSxDQUFDLGdCQUFnQixDQUFBO1FBQ3JELE1BQU0sY0FBYyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUE7UUFDekQsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQTtRQUM1RSxJQUFJLFFBQVEsS0FBSyxTQUFTLEVBQUU7WUFDMUIsTUFBTSxJQUFJLEtBQUssQ0FDYixxQ0FBcUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUMzRCxDQUFBO1NBQ0Y7UUFDRCxNQUFNLFNBQVMsR0FBRyxNQUFNLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQTtRQUMzQyxNQUFNLGtCQUFrQixHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7UUFDdEUsTUFBTSxPQUFPLHFCQUNSLElBQUksSUFDUCxRQUFRO1lBQ1Isa0JBQWtCLEdBQ25CLENBQUE7UUFDRCxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxHQUFHLFlBQVksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLENB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LENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFBO0tBQ3pEO0FBQ0gsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFdlYnZpZXdIYW5kbGVyIH0gZnJvbSAnLi93ZWJ2aWV3LWhhbmRsZXInXG5pbXBvcnQgeyBhdG9tQ29uZmlnIH0gZnJvbSAnLi4vdXRpbCdcbmltcG9ydCB7IHJlbmRlciB9IGZyb20gJy4uL3JlbmRlcmVyJ1xuaW1wb3J0IHsgd3JpdGVGaWxlIH0gZnJvbSAnZnMnXG5pbXBvcnQgeyBDb25maWdWYWx1ZXMgfSBmcm9tICdhdG9tJ1xuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gc2F2ZUFzUERGKFxuICB0ZXh0OiBzdHJpbmcsXG4gIGZpbGVQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gIHJlbmRlckxhVGVYOiBib29sZWFuLFxuICBzYXZlRmlsZVBhdGg6IHN0cmluZyxcbik6IFByb21pc2U8dm9pZD4ge1xuICBjb25zdCB2aWV3ID0gbmV3IFdlYnZpZXdIYW5kbGVyKGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBvcHRzID0gYXRvbUNvbmZpZygpLnNhdmVDb25maWcuc2F2ZVRvUERGT3B0aW9uc1xuICAgIGNvbnN0IGN1c3RvbVBhZ2VTaXplID0gcGFyc2VQYWdlU2l6ZShvcHRzLmN1c3RvbVBhZ2VTaXplKVxuICAgIGNvbnN0IHBhZ2VTaXplID0gb3B0cy5wYWdlU2l6ZSA9PT0gJ0N1c3RvbScgPyBjdXN0b21QYWdlU2l6ZSA6IG9wdHMucGFnZVNpemVcbiAgICBpZiAocGFnZVNpemUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICBgRmFpbGVkIHRvIHBhcnNlIGN1c3RvbSBwYWdlIHNpemU6ICR7b3B0cy5jdXN0b21QYWdlU2l6ZX1gLFxuICAgICAgKVxuICAgIH1cbiAgICBjb25zdCBzZWxlY3Rpb24gPSBhd2FpdCB2aWV3LmdldFNlbGVjdGlvbigpXG4gICAgY29uc3QgcHJpbnRTZWxlY3Rpb25Pbmx5ID0gc2VsZWN0aW9uID8gb3B0cy5wcmludFNlbGVjdGlvbk9ubHkgOiBmYWxzZVxuICAgIGNvbnN0IG5ld09wdHMgPSB7XG4gICAgICAuLi5vcHRzLFxuICAgICAgcGFnZVNpemUsXG4gICAgICBwcmludFNlbGVjdGlvbk9ubHksXG4gICAgfVxuICAgIGNvbnN0IFt3aWR0aCwgaGVpZ2h0XSA9IGdldFBhZ2VXaWR0aChuZXdPcHRzLnBhZ2VTaXplKVxuXG4gICAgdmlldy5pbml0KHtcbiAgICAgIGF0b21Ib21lOiBhdG9tLmdldENvbmZpZ0RpclBhdGgoKSxcbiAgICAgIG1hdGhKYXhDb25maWc6IHsgLi4uYXRvbUNvbmZpZygpLm1hdGhDb25maWcgfSxcbiAgICAgIGNvbnRleHQ6ICdwZGYtZXhwb3J0JyxcbiAgICAgIHBkZkV4cG9ydE9wdGlvbnM6IHsgd2lkdGg6IG5ld09wdHMubGFuZHNjYXBlID8gaGVpZ2h0IDogd2lkdGggfSxcbiAgICB9KVxuICAgIHZpZXcuc2V0QmFzZVBhdGgoZmlsZVBhdGgpXG5cbiAgICBjb25zdCBkb21Eb2N1bWVudCA9IGF3YWl0IHJlbmRlcih7XG4gICAgICB0ZXh0LFxuICAgICAgZmlsZVBhdGgsXG4gICAgICByZW5kZXJMYVRlWCxcbiAgICAgIG1vZGU6ICdjb3B5JyxcbiAgICB9KVxuICAgIGF3YWl0IHZpZXcudXBkYXRlKGRvbURvY3VtZW50LmRvY3VtZW50RWxlbWVudCEub3V0ZXJIVE1MLCByZW5kZXJMYVRlWClcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgdmlldy5wcmludFRvUERGKG5ld09wdHMpXG5cbiAgICAgIGF3YWl0IG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgd3JpdGVGaWxlKHNhdmVGaWxlUGF0aCwgZGF0YSwgKGVycm9yKSA9PiB7XG4gICAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICByZWplY3QoZXJyb3IpXG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzb2x2ZSgpXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnN0IGVycm9yID0gZSBhcyBFcnJvclxuICAgICAgYXRvbS5ub3RpZmljYXRpb25zLmFkZEVycm9yKCdGYWlsZWQgc2F2aW5nIHRvIFBERicsIHtcbiAgICAgICAgZGVzY3JpcHRpb246IGVycm9yLnRvU3RyaW5nKCksXG4gICAgICAgIGRpc21pc3NhYmxlOiB0cnVlLFxuICAgICAgICBzdGFjazogZXJyb3Iuc3RhY2ssXG4gICAgICB9KVxuICAgIH1cblxuICAgIHZpZXcuZGVzdHJveSgpXG4gIH0pXG4gIHZpZXcuZWxlbWVudC5zdHlsZS5wb2ludGVyRXZlbnRzID0gJ25vbmUnXG4gIHZpZXcuZWxlbWVudC5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSdcbiAgdmlldy5lbGVtZW50LnN0eWxlLndpZHRoID0gJzBweCdcbiAgdmlldy5lbGVtZW50LnN0eWxlLmhlaWdodCA9ICcwcHgnXG4gIGNvbnN0IHdzID0gYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKVxuICB3cy5hcHBlbmRDaGlsZCh2aWV3LmVsZW1lbnQpXG59XG5cbnR5cGUgVW5pdCA9ICdtbScgfCAnY20nIHwgJ2luJ1xuXG5mdW5jdGlvbiBwYXJzZVBhZ2VTaXplKHNpemU6IHN0cmluZykge1xuICBpZiAoIXNpemUpIHJldHVybiB1bmRlZmluZWRcbiAgY29uc3QgcnggPSAvXihbXFxkLixdKykoY218bW18aW4pP3goW1xcZC4sXSspKGNtfG1tfGluKT8kL2lcbiAgY29uc3QgcmVzID0gc2l6ZS5yZXBsYWNlKC9cXHMqL2csICcnKS5tYXRjaChyeClcbiAgaWYgKHJlcykge1xuICAgIGNvbnN0IHdpZHRoID0gcGFyc2VGbG9hdChyZXNbMV0pXG4gICAgY29uc3Qgd3VuaXQgPSByZXNbMl0gYXMgVW5pdCB8IHVuZGVmaW5lZFxuICAgIGNvbnN0IGhlaWdodCA9IHBhcnNlRmxvYXQocmVzWzNdKVxuICAgIGNvbnN0IGh1bml0ID0gcmVzWzRdIGFzIFVuaXQgfCB1bmRlZmluZWRcbiAgICByZXR1cm4ge1xuICAgICAgd2lkdGg6IGNvbnZlcnQod2lkdGgsIHd1bml0KSxcbiAgICAgIGhlaWdodDogY29udmVydChoZWlnaHQsIGh1bml0KSxcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZFxuICB9XG59XG5cbnR5cGUgUGFnZVNpemUgPVxuICB8IEV4Y2x1ZGU8XG4gICAgICBDb25maWdWYWx1ZXNbJ21hcmtkb3duLXByZXZpZXctcGx1cy5zYXZlQ29uZmlnLnNhdmVUb1BERk9wdGlvbnMucGFnZVNpemUnXSxcbiAgICAgICdDdXN0b20nXG4gICAgPlxuICB8IHsgd2lkdGg6IG51bWJlcjsgaGVpZ2h0OiBudW1iZXIgfVxuXG5mdW5jdGlvbiBjb252ZXJ0KHZhbDogbnVtYmVyLCB1bml0PzogVW5pdCkge1xuICByZXR1cm4gdmFsICogdW5pdEluTWljcm9ucyh1bml0KVxufVxuXG5mdW5jdGlvbiB1bml0SW5NaWNyb25zKHVuaXQ6IFVuaXQgPSAnbW0nKSB7XG4gIHN3aXRjaCAodW5pdCkge1xuICAgIGNhc2UgJ21tJzpcbiAgICAgIHJldHVybiAxMDAwXG4gICAgY2FzZSAnY20nOlxuICAgICAgcmV0dXJuIDEwMDAwXG4gICAgY2FzZSAnaW4nOlxuICAgICAgcmV0dXJuIDI1NDAwXG4gIH1cbn1cblxuZnVuY3Rpb24gZ2V0UGFnZVdpZHRoKHBhZ2VTaXplOiBQYWdlU2l6ZSkge1xuICBzd2l0Y2ggKHBhZ2VTaXplKSB7XG4gICAgY2FzZSAnQTMnOlxuICAgICAgcmV0dXJuIFsyOTcsIDQyMF1cbiAgICBjYXNlICdBNCc6XG4gICAgICByZXR1cm4gWzIxMCwgMjk3XVxuICAgIGNhc2UgJ0E1JzpcbiAgICAgIHJldHVybiBbMTQ4LCAyMTBdXG4gICAgY2FzZSAnTGVnYWwnOlxuICAgICAgcmV0dXJuIFsyMTYsIDM1Nl1cbiAgICBjYXNlICdMZXR0ZXInOlxuICAgICAgcmV0dXJuIFsyMTYsIDI3OV1cbiAgICBjYXNlICdUYWJsb2lkJzpcbiAgICAgIHJldHVybiBbMjc5LCA0MzJdXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBbcGFnZVNpemUud2lkdGggLyAxMDAwLCBwYWdlU2l6ZS5oZWlnaHQgLyAxMDAwXVxuICB9XG59XG4iXX0=