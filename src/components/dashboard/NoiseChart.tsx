import React from 'react';
import UsageChart from '../../components/UsageChart';
import { InfoIcon, ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from '../../components/Icons';

const Dashboard: React.FC = () => {
  
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <p className="text-gray-500 text-sm">Rango seleccionado:</p>
            <h1 className="text-3xl font-bold text-gray-800">20 al 27 de Febrero</h1>
          </div>
          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <button className="p-2 rounded-full hover:bg-gray-100">
              <InfoIcon />
            </button>
            <div className="flex items-center bg-white border border-gray-200 rounded-lg">
              <button className="p-2 hover:bg-gray-100 rounded-l-lg">
                <ChevronLeftIcon />
              </button>
              <span className="px-3 text-sm text-gray-600">Rango</span>
              <button className="p-2 hover:bg-gray-100 rounded-r-lg">
                <ChevronRightIcon />
              </button>
            </div>
            <div className="flex items-center bg-gray-100 rounded-full p-0.5">
              <button className="px-4 py-1.5 text-sm font-semibold text-white bg-blue-500 rounded-full shadow">dB</button>
              <button className="px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-full">Incidencias</button>
            </div>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <MoreHorizontalIcon />
            </button>
          </div>
        </header>

        <main className="bg-white rounded-lg shadow-sm border-t-4 border-blue-500 p-2 sm:p-4">
          <UsageChart />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
