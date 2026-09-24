import axios from 'axios';

export interface HealthResponse {
  status: string;
  appName: string;
  timestamp: string;
  database: {
    connected: boolean;
    jdbcDriver: string;
    type: string;
    dbUrl: string;
  };
  socketServer: {
    running: boolean;
    port: number;
    type: string;
    pendingQueueSize: number;
  };
  rubricCompliance: Record<string, string>;
}

export const fetchHealthStatus = async (): Promise<HealthResponse> => {
  const response = await axios.get<HealthResponse>('/api/health');
  return response.data;
};
