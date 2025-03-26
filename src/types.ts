export interface ConversionProgress {
  status: 'idle' | 'fetching' | 'converting' | 'completed' | 'error';
  message: string;
  progress: number;
  markdown?: string;
  error?: string;
}

export interface ConversionState extends ConversionProgress {
  url: string;
  setUrl: (url: string) => void;
  startConversion: () => Promise<void>;
  downloadMarkdown: () => void;
}