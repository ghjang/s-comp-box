interface DownloadParams {
    abcjs: any;
    visualObj?: any;
    abcjsEditor: any;
  }
  
  export function downloadMidiFile(node: HTMLElement, params: DownloadParams): void;
  export function downloadPdfFile(node: HTMLElement, params: DownloadParams): void;
  