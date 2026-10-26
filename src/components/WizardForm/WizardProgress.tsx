import React from 'react';
import { MapPin, Users, BookOpen, MessageSquare, Camera, PenTool, Check } from 'lucide-react';
import { Language } from '../../types/plc';
import { translations } from '../../utils/translations';

interface WizardProgressProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
  lang: Language;
  lastSavedTime?: string;
}

export const WizardProgress: React.FC<WizardProgressProps> = ({
  currentStep,
  totalSteps,
  onStepClick,
  lang,
  lastSavedTime,
}) => {
  const t = translations[lang];

  const steps = [
    { num: 1, title: t.step1_title, icon: MapPin },
    { num: 2, title: t.step2_title, icon: Users },
    { num: 3, title: t.step3_title, icon: BookOpen },
    { num: 4, title: t.step4_title, icon: MessageSquare },
    { num: 5, title: t.step5_title, icon: Camera },
    { num: 6, title: t.step6_title, icon: PenTool },
  ];

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">
            {lang === 'ms' ? 'Langkah' : 'Step'} {currentStep} {lang === 'ms' ? 'daripada' : 'of'} {totalSteps}
          </span>
          <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
            {steps[currentStep - 1]?.title}
          </h3>
        </div>
        {lastSavedTime && (
          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {t.alert_auto_saved} {lastSavedTime}
            </span>
          </div>
        )}
      </div>

      {/* Step Indicators */}
      <div className="grid grid-cols-6 gap-1 sm:gap-2">
        {steps.map((s) => {
          const Icon = s.icon;
          const isDone = s.num < currentStep;
          const isCurrent = s.num === currentStep;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => onStepClick && onStepClick(s.num)}
              className={`flex flex-col items-center justify-center p-2 rounded-xl transition cursor-pointer text-center ${
                isCurrent
                  ? 'bg-teal-600 text-white font-bold shadow-md shadow-teal-700/20'
                  : isDone
                  ? 'bg-teal-50 text-teal-800 hover:bg-teal-100'
                  : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
              }`}
            >
              <div className="flex items-center justify-center w-6 h-6 mb-1 rounded-full text-xs">
                {isDone ? (
                  <Check className="w-4 h-4 stroke-[3] text-teal-700" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
              <span className="text-[10px] sm:text-xs truncate w-full hidden md:block">
                {s.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
