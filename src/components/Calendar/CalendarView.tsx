import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Trash2, Edit } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatDate } from '../../utils/calculations';

const CalendarView: React.FC = () => {
  const { holidays, addHoliday, deleteHoliday } = useData();
  const { overtimes, leaves } = useData();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAddHoliday, setShowAddHoliday] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newHoliday, setNewHoliday] = useState({
    date: '',
    name: '',
    isRecurring: false
  });

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const dayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // Monday = 0

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isHoliday = (date: Date | null) => {
    if (!date) return false;
    const dateStr = date.toISOString().split('T')[0];
    return holidays.some(holiday => holiday.date === dateStr);
  };

  const getHolidayName = (date: Date | null) => {
    if (!date) return '';
    const dateStr = date.toISOString().split('T')[0];
    const holiday = holidays.find(holiday => holiday.date === dateStr);
    return holiday?.name || '';
  };

  const isWeekend = (date: Date | null) => {
    if (!date) return false;
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleAddHoliday = (e: React.FormEvent) => {
    e.preventDefault();
    addHoliday(newHoliday);
    setShowAddHoliday(false);
    setNewHoliday({ date: '', name: '', isRecurring: false });
  };

  const userOvertimes = overtimes.filter(o => o.userId === user?.id);
  const userLeaves = leaves.filter(l => l.userId === user?.id);

  const getDayEvents = (date: Date | null) => {
    if (!date) return { holiday: null, leave: null, overtime: null };
    const dateStr = date.toISOString().split('T')[0];
    const holiday = holidays.find(h => h.date === dateStr);
    const leave = userLeaves.find(l => {
      const start = new Date(l.startDate);
      const end = new Date(l.endDate);
      return date >= start && date <= end;
    });
    const overtime = userOvertimes.find(o => o.date === dateStr);
    return { holiday, leave, overtime };
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Takvim & Tatiller</h1>
          <p className="text-gray-600 dark:text-gray-400">Resmi tatilleri görüntüleyin ve yönetin</p>
        </div>
        <button
          onClick={() => setShowAddHoliday(!showAddHoliday)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Tatil Ekle
        </button>
      </div>

      {showAddHoliday && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Yeni Tatil Ekle</h3>
          <form onSubmit={handleAddHoliday} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tarih</label>
              <input
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tatil Adı</label>
              <input
                type="text"
                value={newHoliday.name}
                onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Örn: Kurban Bayramı"
                required
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newHoliday.isRecurring}
                  onChange={(e) => setNewHoliday({ ...newHoliday, isRecurring: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Her yıl tekrar et</span>
              </label>
            </div>
            <div className="md:col-span-3 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddHoliday(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                İptal
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Kaydet
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            const events = getDayEvents(date);
            return (
              <div
                key={index}
                className={`min-h-[80px] p-2 border border-gray-100 dark:border-gray-600 rounded-lg ${
                  date ? 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600' : 'bg-gray-50 dark:bg-gray-800'
                } ${isHoliday(date) ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : ''} ${
                  isWeekend(date) && !isHoliday(date) ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : ''
                }`}
              >
                {date && (
                  <>
                    <div className={`text-sm font-medium ${
                      isHoliday(date) ? 'text-red-700 dark:text-red-400' : 
                      isWeekend(date) ? 'text-blue-700 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                    }`}>
                      {date.getDate()}
                    </div>
                    {isHoliday(date) && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1 leading-tight">
                        {getHolidayName(date)}
                      </div>
                    )}
                    <div className="flex flex-col gap-1 mt-1">
                      {events.holiday && (
                        <div className="w-2 h-2 bg-red-500 rounded-full mx-auto" title={events.holiday.name}></div>
                      )}
                      {events.leave && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mx-auto" title="İzin"></div>
                      )}
                      {events.overtime && (
                        <div className="w-2 h-2 bg-green-500 rounded-full mx-auto" title="Mesai"></div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Resmi Tatil</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Hafta Sonu</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Çalışma Günü</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-gray-600 dark:text-gray-400">Mesai Günü</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center mb-6">
          <CalendarIcon className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tatiller</h3>
        </div>
        
        {holidays.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {holidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{holiday.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(holiday.date)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  {holiday.isRecurring && (
                    <span className="text-xs bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 px-2 py-1 rounded-full">
                      Yıllık
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    new Date(holiday.date) > new Date() 
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400' 
                      : 'bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-300'
                  }`}>
                    {new Date(holiday.date) > new Date() ? 'Yaklaşan' : 'Geçmiş'}
                  </span>
                  <button
                    onClick={() => deleteHoliday(holiday.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">Henüz tatil eklenmemiş</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">Yukarıdaki "Tatil Ekle" butonunu kullanarak tatil ekleyebilirsiniz</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;