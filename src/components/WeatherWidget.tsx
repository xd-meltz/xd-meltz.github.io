import React, { useState, useEffect } from 'react';
import { 
  Sun, 
  CloudSun, 
  CloudRain, 
  CloudLightning, 
  Droplets
} from 'lucide-react';

export interface HourlyWeather {
  temp: number;
  rainProb: number;
  precipMm: number;
  condition: string;
  iconType: 'sunny' | 'cloudy' | 'rain' | 'thunder';
}

export interface WeatherData {
  date: string;
  available: boolean;
  message?: string;
  tempMax?: number;
  tempMin?: number;
  temperature?: number;
  precipitationMm?: number;
  rainPercentage?: number;
  symbolCode?: string;
  condition?: string;
  iconType?: 'sunny' | 'cloudy' | 'rain' | 'thunder';
  hourly?: Record<string, HourlyWeather>;
  source?: string;
}

interface WeatherWidgetProps {
  date: string;
  selectedSlot?: string;
  className?: string;
}

export default function WeatherWidget({ date, selectedSlot, className = '' }: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    if (!date) {
      setWeather(null);
      return;
    }

    let isMounted = true;

    fetch(`/api/weather?date=${date}`)
      .then((res) => {
        if (!res.ok) throw new Error('API request failed');
        return res.json();
      })
      .then((data: WeatherData) => {
        if (isMounted) {
          setWeather(data);
        }
      })
      .catch(async () => {
        // Direct MET Norway Stellenbosch fetch fallback
        try {
          const res = await fetch('https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=-33.9321&lon=18.8602');
          if (!res.ok) throw new Error('MET Norway fetch failed');
          const metData = await res.json();
          const timeseries: any[] = metData?.properties?.timeseries || [];

          const dateEntries = timeseries.filter(item => {
            const itemUtc = new Date(item.time);
            const sastTime = new Date(itemUtc.getTime() + 2 * 60 * 60 * 1000);
            const yyyy = sastTime.getUTCFullYear();
            const mm = String(sastTime.getUTCMonth() + 1).padStart(2, '0');
            const dd = String(sastTime.getUTCDate()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd}` === date;
          });

          if (dateEntries.length === 0) {
            if (isMounted) setWeather({ date, available: false });
            return;
          }

          let maxTemp = -999;
          let minTemp = 999;
          let maxRainProb = 0;
          let totalPrecipMm = 0;
          let symbolCode = 'clearsky_day';
          const hourlyMap: Record<string, HourlyWeather> = {};

          dateEntries.forEach(entry => {
            const sastTime = new Date(new Date(entry.time).getTime() + 2 * 60 * 60 * 1000);
            const hour = sastTime.getUTCHours();
            const details = entry.data?.instant?.details;

            if (details && typeof details.air_temperature === 'number') {
              const temp = Math.round(details.air_temperature);
              if (temp > maxTemp) maxTemp = temp;
              if (temp < minTemp) minTemp = temp;

              const next1 = entry.data?.next_1_hours;
              const next6 = entry.data?.next_6_hours;
              const sym = next1?.summary?.symbol_code || next6?.summary?.symbol_code || 'clearsky_day';
              const rainProb = Math.round(next1?.details?.probability_of_precipitation ?? next6?.details?.probability_of_precipitation ?? 0);
              const precipMm = Number((next1?.details?.precipitation_amount ?? next6?.details?.precipitation_amount ?? 0).toFixed(1));

              let iconType: 'sunny' | 'cloudy' | 'rain' | 'thunder' = 'sunny';
              let condition = 'Sunny';
              const lowerCode = sym.toLowerCase();
              if (lowerCode.includes('thunder')) {
                iconType = 'thunder';
                condition = 'Thunderstorm';
              } else if (lowerCode.includes('rain') || lowerCode.includes('shower')) {
                iconType = 'rain';
                condition = lowerCode.includes('heavy') ? 'Heavy Rain' : 'Rain';
              } else if (lowerCode.includes('cloud')) {
                iconType = 'cloudy';
                condition = 'Partly Cloudy';
              }

              if (hour >= 7 && hour <= 18) {
                maxRainProb = Math.max(maxRainProb, rainProb);
                totalPrecipMm += precipMm;
                symbolCode = sym;
              }

              hourlyMap[hour.toString()] = {
                temp,
                rainProb,
                precipMm,
                condition,
                iconType
              };
            }
          });

          if (maxTemp === -999) {
            maxTemp = 22;
            minTemp = 12;
          }

          let iconType: 'sunny' | 'cloudy' | 'rain' | 'thunder' = 'sunny';
          let condition = 'Sunny';
          const lowerCode = symbolCode.toLowerCase();
          if (lowerCode.includes('thunder')) {
            iconType = 'thunder';
            condition = 'Thunderstorm';
          } else if (lowerCode.includes('rain') || lowerCode.includes('shower')) {
            iconType = 'rain';
            condition = 'Rain';
          } else if (lowerCode.includes('cloud')) {
            iconType = 'cloudy';
            condition = 'Partly Cloudy';
          }

          if (isMounted) {
            setWeather({
              date,
              available: true,
              tempMax: Math.round(maxTemp),
              tempMin: Math.round(minTemp),
              temperature: Math.round(maxTemp),
              precipitationMm: Number(totalPrecipMm.toFixed(1)),
              rainPercentage: Math.round(maxRainProb),
              symbolCode,
              condition,
              iconType,
              hourly: hourlyMap,
              source: 'Yr.no (MET Norway)'
            });
          }
        } catch (e) {
          if (isMounted) setWeather({ date, available: false });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [date]);

  // If no weather available or missing, show nothing as requested
  if (!weather || !weather.available) {
    return null;
  }

  // Get specific hourly weather if a slot is selected
  let activeWeather: {
    tempStr: string;
    condition: string;
    iconType: 'sunny' | 'cloudy' | 'rain' | 'thunder';
    rainProb: number;
    precipMm: number;
    label: string;
  } | null = null;

  if (selectedSlot) {
    let match: HourlyWeather | null = null;
    if (weather.hourly && Object.keys(weather.hourly).length > 0) {
      const parts = selectedSlot.split(':');
      if (parts.length >= 2) {
        const h = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10);
        const targetHour = m >= 30 ? h + 1 : h;

        let bestKey: string | null = null;
        let minDiff = 999;

        Object.keys(weather.hourly).forEach((key) => {
          const keyHour = parseInt(key, 10);
          if (!isNaN(keyHour)) {
            const diff = Math.abs(keyHour - targetHour);
            if (diff < minDiff) {
              minDiff = diff;
              bestKey = key;
            }
          }
        });

        if (bestKey && weather.hourly[bestKey]) {
          match = weather.hourly[bestKey];
        }
      }
    }

    if (match) {
      activeWeather = {
        tempStr: `${match.temp}°C`,
        condition: match.condition,
        iconType: match.iconType,
        rainProb: match.rainProb,
        precipMm: match.precipMm,
        label: `${selectedSlot} Weather`
      };
    } else {
      const tMax = weather.tempMax ?? weather.temperature ?? 22;
      activeWeather = {
        tempStr: `${tMax}°C`,
        condition: weather.condition || 'Sunny',
        iconType: weather.iconType || 'sunny',
        rainProb: weather.rainPercentage ?? 0,
        precipMm: weather.precipitationMm ?? 0,
        label: `${selectedSlot} Weather`
      };
    }
  }

  if (!activeWeather) {
    const tMax = weather.tempMax ?? weather.temperature ?? 22;
    const tMin = weather.tempMin ?? Math.max(8, tMax - 10);
    activeWeather = {
      tempStr: `${tMax}/${tMin}°C`,
      condition: weather.condition || 'Sunny',
      iconType: weather.iconType || 'sunny',
      rainProb: weather.rainPercentage ?? 0,
      precipMm: weather.precipitationMm ?? 0,
      label: 'Day Weather'
    };
  }

  const renderWeatherIcon = (iconType?: string) => {
    switch (iconType) {
      case 'rain':
        return <CloudRain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0" />;
      case 'thunder':
        return <CloudLightning className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />;
      case 'cloudy':
        return <CloudSun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-300 flex-shrink-0" />;
      case 'sunny':
      default:
        return <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 flex-shrink-0" />;
    }
  };

  return (
    <div className={`bg-zinc-950 border border-zinc-800 px-2 sm:px-3 py-1 sm:py-1.5 font-mono text-xs flex items-center justify-between gap-1 sm:gap-2 overflow-hidden ${className}`}>
      <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 truncate">
        {renderWeatherIcon(activeWeather.iconType)}
        <span className="font-extrabold text-white text-[9px] sm:text-[11px] uppercase tracking-tight sm:tracking-wider truncate">
          {activeWeather.label}: <span className="text-zinc-300 font-normal">{activeWeather.condition}</span>
        </span>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-3 text-[9px] sm:text-[11px] shrink-0 font-mono">
        <span className="text-emerald-400 font-black">{activeWeather.tempStr}</span>
        <div className="flex items-center gap-0.5 sm:gap-1 text-cyan-400 font-bold">
          <Droplets className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
          <span>{activeWeather.rainProb}%<span className="hidden sm:inline"> ({activeWeather.precipMm}mm)</span></span>
        </div>
      </div>
    </div>
  );
}
