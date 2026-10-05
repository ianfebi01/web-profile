import React from 'react'
import Markdown from './Parsers/Markdown'

export interface IStep {
  name: string
  role: string
  description: string
  status: 'complete' | 'current' | 'upcoming'
  totalWorkingMonths: number
}

interface Props {
  steps: IStep[]
  convertMonthsToYearsAndMonths: ( val: number ) => string
}

const ProgressVertical: React.FC<Props> = ( {
  steps,
  convertMonthsToYearsAndMonths,
} ) => {
  return (
    <nav aria-label="Progress">
      <ol role="list"
        className="overflow-hidden"
      >
        {steps.map( ( step, stepIdx ) => (
          <li key={step.role}
            className={` relative`}
          >
            {step.status === 'complete' && (
              <>
                {stepIdx !== steps.length - 1 && (
                  <div
                    className="absolute left-2 top-4 -ml-px mt-0.5 h-full w-0.5 bg-[#4D4D4D]"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start group">
                  <span className="flex items-center h-7">
                    <span className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-[#4D4D4D]"></span>
                  </span>
                  <span className="flex flex-col min-w-0 ml-4">
                    <h4 className="h3">{step.role}</h4>
                    <p className="mt-0 mb-2 text-sm">
                      {convertMonthsToYearsAndMonths( step.totalWorkingMonths )}
                    </p>
                    <div className="text-black/80 dark:text-white/80">
                      <Markdown content={step.description} />
                    </div>
                  </span>
                </div>
              </>
            )}
            {step.status === 'current' && (
              <>
                {stepIdx !== steps.length - 1 && (
                  <div
                    className="absolute left-2 top-4 -ml-px mt-0.5 h-full w-0.5 bg-[#4D4D4D]"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start mb-2 group">
                  <span className="flex items-center h-7">
                    <span className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-[#4D4D4D]"></span>
                  </span>
                  <span className="flex flex-col min-w-0 ml-4">
                    <h4 className="h3">{step.role}</h4>
                    <p className="mt-0 mb-2 text-sm">
                      {convertMonthsToYearsAndMonths( step.totalWorkingMonths )}
                    </p>
                    <div className="text-black/80 dark:text-white/80">
                      <Markdown content={step.description} />
                    </div>
                  </span>
                </div>
              </>
            )}
            {step.status === 'upcoming' && (
              <>
                {stepIdx !== steps.length - 1 && (
                  <div
                    className="absolute left-2 top-4 -ml-px mt-0.5 h-full w-0.5 bg-gray-300"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex items-start group">
                  <span className="flex items-center h-7"
                    aria-hidden="true"
                  >
                    <span className="relative z-10 flex items-center justify-center w-4 h-4 bg-white border-2 border-gray-300 rounded-full group-hover:border-gray-400">
                      <span className="h-2.5 w-2.5 rounded-full bg-transparent group-hover:bg-gray-300" />
                    </span>
                  </span>
                  <div className="relative flex items-start group">
                    <span className="flex items-center h-7">
                      <span className="relative z-10 flex h-4 w-4 items-center justify-center rounded-full bg-[#4D4D4D]"></span>
                    </span>
                    <span className="flex flex-col min-w-0 ml-4">
                      <h4 className="h3">{step.role}</h4>
                      <p className="mt-0 mb-2 text-sm">
                        {convertMonthsToYearsAndMonths( step.totalWorkingMonths )}
                      </p>
                      <div className="text-black/80 dark:text-white/80">
                        <Markdown content={step.description} />
                      </div>
                    </span>
                  </div>
                </div>
              </>
            )}
          </li>
        ) )}
      </ol>
    </nav>
  )
}

export default ProgressVertical
