import React, { useState, Children, useRef, useLayoutEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Stepper.css'

/*
 * Stepper multipaso (React Bits) — adaptado a AKIRA: usa framer-motion (no
 * motion/react) y los colores de marca vía CSS (Stepper.css). Se usa para el
 * alta de cuenta guiada. `completeButtonText` localiza el botón final.
 */
export default function Stepper({
  children,
  initialStep = 1,
  onStepChange = function () {},
  onFinalStepCompleted = function () {},
  stepCircleContainerClassName = '',
  stepContainerClassName = '',
  contentClassName = '',
  footerClassName = '',
  backButtonProps = {},
  nextButtonProps = {},
  backButtonText = 'Atrás',
  nextButtonText = 'Continuar',
  completeButtonText = 'Completar',
  disableStepIndicators = false,
  renderStepIndicator,
  ...rest
}) {
  var [currentStep, setCurrentStep] = useState(initialStep)
  var [direction, setDirection] = useState(0)
  var stepsArray = Children.toArray(children)
  var totalSteps = stepsArray.length
  var isCompleted = currentStep > totalSteps
  var isLastStep = currentStep === totalSteps

  function updateStep(newStep) {
    setCurrentStep(newStep)
    if (newStep > totalSteps) onFinalStepCompleted()
    else onStepChange(newStep)
  }

  function handleBack() {
    if (currentStep > 1) { setDirection(-1); updateStep(currentStep - 1) }
  }
  function handleNext() {
    if (!isLastStep) { setDirection(1); updateStep(currentStep + 1) }
  }
  function handleComplete() {
    setDirection(1); updateStep(totalSteps + 1)
  }

  return (
    <div className="outer-container" {...rest}>
      <div className={'step-circle-container ' + stepCircleContainerClassName}>
        <div className={'step-indicator-row ' + stepContainerClassName}>
          {stepsArray.map(function (_, index) {
            var stepNumber = index + 1
            var isNotLastStep = index < totalSteps - 1
            return (
              <React.Fragment key={stepNumber}>
                {renderStepIndicator ? renderStepIndicator({
                  step: stepNumber, currentStep: currentStep,
                  onStepClick: function (clicked) { setDirection(clicked > currentStep ? 1 : -1); updateStep(clicked) },
                }) : (
                  <StepIndicator
                    step={stepNumber}
                    disableStepIndicators={disableStepIndicators}
                    currentStep={currentStep}
                    onClickStep={function (clicked) { setDirection(clicked > currentStep ? 1 : -1); updateStep(clicked) }}
                  />
                )}
                {isNotLastStep && <StepConnector isComplete={currentStep > stepNumber} />}
              </React.Fragment>
            )
          })}
        </div>

        <StepContentWrapper
          isCompleted={isCompleted}
          currentStep={currentStep}
          direction={direction}
          className={'step-content-default ' + contentClassName}
        >
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>

        {!isCompleted && (
          <div className={'footer-container ' + footerClassName}>
            <div className={'footer-nav ' + (currentStep !== 1 ? 'spread' : 'end')}>
              {currentStep !== 1 && (
                <button onClick={handleBack} className={'back-button ' + (currentStep === 1 ? 'inactive' : '')} {...backButtonProps}>
                  {backButtonText}
                </button>
              )}
              <button onClick={isLastStep ? handleComplete : handleNext} className="next-button" {...nextButtonProps}>
                {isLastStep ? completeButtonText : nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StepContentWrapper({ isCompleted, currentStep, direction, children, className }) {
  var [parentHeight, setParentHeight] = useState(0)
  return (
    <motion.div
      className={className}
      style={{ position: 'relative', overflow: 'hidden' }}
      animate={{ height: isCompleted ? 0 : parentHeight }}
      transition={{ type: 'spring', duration: 0.4 }}
    >
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction} onHeightReady={function (h) { setParentHeight(h) }}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SlideTransition({ children, direction, onHeightReady }) {
  var containerRef = useRef(null)
  useLayoutEffect(function () {
    if (containerRef.current) onHeightReady(containerRef.current.offsetHeight)
  }, [children, onHeightReady])
  return (
    <motion.div
      ref={containerRef}
      custom={direction}
      variants={stepVariants}
      initial="enter" animate="center" exit="exit"
      transition={{ duration: 0.4 }}
      style={{ position: 'absolute', left: 0, right: 0, top: 0 }}
    >
      {children}
    </motion.div>
  )
}

var stepVariants = {
  enter: function (dir) { return { x: dir >= 0 ? '-100%' : '100%', opacity: 0 } },
  center: { x: '0%', opacity: 1 },
  exit: function (dir) { return { x: dir >= 0 ? '50%' : '-50%', opacity: 0 } },
}

export function Step({ children }) {
  return <div className="step-default">{children}</div>
}

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators }) {
  var status = currentStep === step ? 'active' : currentStep < step ? 'inactive' : 'complete'
  function handleClick() { if (step !== currentStep && !disableStepIndicators) onClickStep(step) }
  return (
    <motion.div onClick={handleClick} className="step-indicator" style={disableStepIndicators ? { pointerEvents: 'none', opacity: 0.5 } : {}} animate={status} initial={false}>
      <motion.div
        variants={{
          inactive: { scale: 1, backgroundColor: 'var(--bg-4)', color: 'var(--text-4)' },
          active:   { scale: 1, backgroundColor: 'var(--brand)', color: '#fff' },
          complete: { scale: 1, backgroundColor: 'var(--brand)', color: '#fff' },
        }}
        transition={{ duration: 0.3 }}
        className="step-indicator-inner"
      >
        {status === 'complete' ? <CheckIcon className="check-icon" />
          : status === 'active' ? <div className="active-dot" />
          : <span className="step-number">{step}</span>}
      </motion.div>
    </motion.div>
  )
}

function StepConnector({ isComplete }) {
  var lineVariants = {
    incomplete: { width: 0, backgroundColor: 'transparent' },
    complete:   { width: '100%', backgroundColor: 'var(--brand)' },
  }
  return (
    <div className="step-connector">
      <motion.div className="step-connector-inner" variants={lineVariants} initial={false}
        animate={isComplete ? 'complete' : 'incomplete'} transition={{ duration: 0.4 }} />
    </div>
  )
}

function CheckIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ delay: 0.1, type: 'tween', ease: 'easeOut', duration: 0.3 }}
        strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
