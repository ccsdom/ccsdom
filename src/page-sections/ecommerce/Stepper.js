import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Step, StepConnector, StepLabel } from "@mui/material";
import MuiStepper from "@mui/material/Stepper";
const STEPS = ["Cart", "Billing & address", "Payment"];
// ============================================================================
const Stepper = ({ stepNo }) => {
    const [activeStep, setActiveStep] = useState(0);
    useEffect(() => {
        if (stepNo)
            setActiveStep(stepNo);
    }, [stepNo]);
    return (_jsx(MuiStepper, { alternativeLabel: true, activeStep: activeStep, connector: _jsx(StepConnector, {}), children: STEPS.map((label) => {
            return (_jsx(Step, { sx: { padding: 0 }, children: _jsx(StepLabel, { children: label }) }, label));
        }) }));
};
export default Stepper;
