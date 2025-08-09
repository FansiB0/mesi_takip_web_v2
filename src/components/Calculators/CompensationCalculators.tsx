import React, { useState } from 'react';
import { Calculator, TrendingUp, AlertCircle } from 'lucide-react';
import { calculateSeverancePay, calculateUnemploymentBenefits, formatCurrency } from '../../utils/calculations';

const CompensationCalculators: React.FC = () => {
  const [severanceData, setSeveranceData] = useState({
    grossSalary: '',
    startDate: '',
    endDate: new Date().toISOString().split('T')[0]
  });

  const [unemploymentData, setUnemploymentData] = useState({
    march: '',
    april: '',
    may: '',
    june: ''
  });

  const [severanceResult, setSeveranceResult] = useState<any>(null);
  const [unemploymentResult, setUnemploymentResult] = useState<any>(null);

  const handleSeveranceCalculate = () => {
    const result = calculateSeverancePay(
      parseFloat(severanceData.grossSalary),
      severanceData.startDate,
      severanceData.endDate
    );
    setSeveranceResult(result);
  };

  const handleUnemploymentCalculate = () => {
    const salaries = [
      parseFloat(unemploymentData.march),
      parseFloat(unemploymentData.april),
      parseFloat(unemploymentData.may),
      parseFloat(unemploymentData.june)
    ];
    const result = calculateUnemploymentBenefits(salaries);
    setUnemploymentResult(result);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tazminat Hesaplayıcıları</h1>
          <p className="text-gray-600 dark:text-gray-400">Kıdem ve işsizlik maaşı hesaplamalarınızı yapın</p>
        </div>
        <Calculator className="h-8 w-8 text-blue-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severance Pay Calculator */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-6">
            <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Kıdem Tazminatı Hesaplayıcı</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Son Brüt Maaş (₺)
              </label>
              <input
                type="number"
                value={severanceData.grossSalary}
                onChange={(e) => setSeveranceData({ ...severanceData, grossSalary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Brüt maaş tutarını girin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                İşe Başlama Tarihi
              </label>
              <input
                type="date"
                value={severanceData.startDate}
                onChange={(e) => setSeveranceData({ ...severanceData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                İşten Ayrılma Tarihi
              </label>
              <input
                type="date"
                value={severanceData.endDate}
                onChange={(e) => setSeveranceData({ ...severanceData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleSeveranceCalculate}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              Kıdem Tazminatını Hesapla
            </button>

            {severanceResult && (
              <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3">Hesaplama Sonucu</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">Çalışma Süresi:</span>
                    <span className="font-medium text-green-800 dark:text-green-200">
                      {Math.floor(severanceResult.workingDays! / 365.25)} yıl {Math.floor((severanceResult.workingDays! % 365.25) / 30)} ay
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">Brüt Kıdem Tazminatı:</span>
                    <span className="font-medium text-green-800 dark:text-green-200">{formatCurrency(severanceResult.grossAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700 dark:text-green-300">Damga Vergisi:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(severanceResult.stampTax)}</span>
                  </div>
                  <hr className="border-green-300 dark:border-green-600" />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-green-800 dark:text-green-200">Net Kıdem Tazminatı:</span>
                    <span className="font-bold text-green-800 dark:text-green-200">{formatCurrency(severanceResult.netAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Unemployment Benefits Calculator */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center mb-6">
            <AlertCircle className="h-6 w-6 text-blue-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">İşsizlik Maaşı Hesaplayıcı</h3>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Son 4 ayın brüt maaş bilgilerini giriniz. İşsizlik maaşı bu ayların ortalamasının %60'ı olarak hesaplanır.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mart 2025 (₺)</label>
                <input
                  type="number"
                  value={unemploymentData.march}
                  onChange={(e) => setUnemploymentData({ ...unemploymentData, march: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Maaş tutarını girin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nisan 2025 (₺)</label>
                <input
                  type="number"
                  value={unemploymentData.april}
                  onChange={(e) => setUnemploymentData({ ...unemploymentData, april: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Maaş tutarını girin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mayıs 2025 (₺)</label>
                <input
                  type="number"
                  value={unemploymentData.may}
                  onChange={(e) => setUnemploymentData({ ...unemploymentData, may: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Maaş tutarını girin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Haziran 2025 (₺)</label>
                <input
                  type="number"
                  value={unemploymentData.june}
                  onChange={(e) => setUnemploymentData({ ...unemploymentData, june: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Maaş tutarını girin"
                />
              </div>
            </div>

            <button
              onClick={handleUnemploymentCalculate}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              İşsizlik Maaşını Hesapla
            </button>

            {unemploymentResult && (
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">Hesaplama Sonucu</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">4 Aylık Ortalama:</span>
                    <span className="font-medium text-blue-800 dark:text-blue-200">{formatCurrency(unemploymentResult.averageSalary!)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">İşsizlik Maaşı (%60):</span>
                    <span className="font-medium text-blue-800 dark:text-blue-200">{formatCurrency(unemploymentResult.grossAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700 dark:text-blue-300">Vergiler ve Kesintiler:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">-{formatCurrency(unemploymentResult.stampTax)}</span>
                  </div>
                  <hr className="border-blue-300 dark:border-blue-600" />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-blue-800 dark:text-blue-200">Net İşsizlik Maaşı:</span>
                    <span className="font-bold text-blue-800 dark:text-blue-200">{formatCurrency(unemploymentResult.netAmount)}</span>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    <strong>Not:</strong> Bu hesaplama tahminidir. Gerçek işsizlik maaşı İŞKUR tarafından belirlenen kriterlere göre değişebilir.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Önemli Bilgiler</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">Kıdem Tazminatı</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• En az 1 yıl çalışma şartı</li>
              <li>• Damga vergisi %0.759 oranında</li>
              <li>• Fesih sebebine göre değişir</li>
              <li>• 2025 yılı tavanı güncellenecek</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">İşsizlik Maaşı</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Son 4 ayın ortalamasının %60'ı</li>
              <li>• En az 600 gün prim ödeme şartı</li>
              <li>• Süre: 180-300 gün arası</li>
              <li>• Alt ve üst limit uygulanır</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompensationCalculators;