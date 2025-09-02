import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Step, Stack, styled, Button, Stepper, StepLabel, StepContent, StepConnector, stepConnectorClasses, useTheme, } from "@mui/material";
import { Fragment, useState } from "react";
import { Check } from "@mui/icons-material";
// CUSTOM COMPONENTS
import { Block } from "@/components/block";
import { FlexBox } from "@/components/flexbox";
import { Paragraph } from "@/components/typography";
import ComponentPageLayout from "../../ComponentPageLayout";
// CUSTOM UTILS METHOD
import { isDark } from "@/utils/constants";
// STYLED COMPONENTS
const CustomConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 10,
        left: "calc(-50% + 16px)",
        right: "calc(50% + 16px)",
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.primary.main,
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: theme.palette.primary.main,
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderRadius: 1,
        borderTopWidth: 3,
        borderColor: theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
    },
}));
const CustomStepIconRoot = styled("div")(({ theme, ownerState }) => ({
    color: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center",
    ...(ownerState.active && { color: theme.palette.primary.main }),
    "& .QontoStepIcon-completedIcon": {
        zIndex: 1,
        fontSize: 18,
        color: theme.palette.primary.main,
    },
    "& .QontoStepIcon-circle": {
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: "currentColor",
    },
}));
const CustomStepIcon = ({ active, completed, className }) => (_jsx(CustomStepIconRoot, { ownerState: { active }, className: className, children: completed ? (_jsx(Check, { className: "QontoStepIcon-completedIcon" })) : (_jsx("div", { className: "QontoStepIcon-circle" })) }));
const linear = [
    "Select campaign settings",
    "Create an ad group",
    "Create an ad",
];
const steps = [
    {
        label: "Select campaign settings",
        description: `For each ad campaign that you create, you can control how much you're willing to spend on clicks and conversions, which networks and geographical locations you want your ads to show on, and more.`,
    },
    {
        label: "Create an ad group",
        description: "An ad group contains one or more ads which target a shared set of keywords.",
    },
    {
        label: "Create an ad",
        description: `Try out different ad text to see what brings in the most customers, and learn how to enhance your ads using features like ad extensions. If you run into any problems with your ads, find out how to tell if they're running and how to resolve approval issues.`,
    },
];
const MuiStepperPageView = () => {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [skipped, setSkipped] = useState(new Set());
    const isStepOptional = (step) => step === 1;
    const isStepSkipped = (step) => skipped.has(step);
    const handleReset = () => setActiveStep(0);
    const handleBack = () => setActiveStep((prevActiveStep) => prevActiveStep - 1);
    const handleNext = () => {
        let newSkipped = skipped;
        if (isStepSkipped(activeStep)) {
            newSkipped = new Set(newSkipped.values());
            newSkipped.delete(activeStep);
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped(newSkipped);
    };
    const handleSkip = () => {
        if (!isStepOptional(activeStep)) {
            throw new Error("You can't skip a step that isn't optional.");
        }
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(activeStep);
            return newSkipped;
        });
    };
    // vertical stepper
    const [verticalStep, setVerticalStep] = useState(0);
    const handleVerticalReset = () => setVerticalStep(0);
    const handleVerticalNext = () => setVerticalStep((state) => state + 1);
    const handleVerticalBack = () => setVerticalStep((state) => state - 1);
    const stepperNavigation = () => {
        return activeStep === linear.length ? (_jsxs(Fragment, { children: [_jsx(Box, { bgcolor: isDark(theme) ? "grey.800" : "grey.50", borderRadius: 3, p: 3, mt: 3, children: _jsx(Paragraph, { fontWeight: 500, children: "All steps completed - you're finished" }) }), _jsxs(FlexBox, { pt: 2, children: [_jsx(Box, { flex: "1 1 auto" }), _jsx(Button, { onClick: handleReset, children: "Reset" })] })] })) : (_jsxs(Fragment, { children: [_jsx(Box, { bgcolor: isDark(theme) ? "grey.800" : "grey.50", borderRadius: 3, p: 3, mt: 3, children: _jsxs(Paragraph, { fontWeight: 500, children: ["Step ", activeStep + 1] }) }), _jsxs(FlexBox, { pt: 2, children: [_jsx(Button, { variant: "text", color: "inherit", onClick: handleBack, disabled: activeStep === 0, children: "Back" }), _jsx(Box, { flex: "1 1 auto" }), isStepOptional(activeStep) && (_jsx(Button, { variant: "text", color: "inherit", onClick: handleSkip, sx: { mr: 1 }, children: "Skip" })), _jsx(Button, { onClick: handleNext, children: activeStep === linear.length - 1 ? "Finish" : "Next" })] })] }));
    };
    return (_jsxs(ComponentPageLayout, { title: "Stepper", children: [_jsxs(Block, { bgTransparent: true, title: "Horizontal Linear", children: [_jsx(Stepper, { activeStep: activeStep, children: linear.map((label, index) => {
                            const completed = isStepSkipped(index) ? false : undefined;
                            const optional = isStepOptional(index) ? (_jsx(Paragraph, { children: "Optional" })) : undefined;
                            return (_jsx(Step, { completed: completed, children: _jsx(StepLabel, { optional: optional, children: label }) }, label));
                        }) }), stepperNavigation()] }), _jsxs(Block, { bgTransparent: true, title: "Alternative Label", children: [_jsx(Stepper, { alternativeLabel: true, activeStep: activeStep, children: linear.map((label, index) => {
                            const completed = isStepSkipped(index) ? false : undefined;
                            const optional = isStepOptional(index) ? (_jsx(Paragraph, { children: "Optional" })) : undefined;
                            return (_jsx(Step, { completed: completed, children: _jsx(StepLabel, { optional: optional, children: label }) }, label));
                        }) }), stepperNavigation()] }), _jsxs(Block, { bgTransparent: true, title: "Customized Stepper", children: [_jsx(Stepper, { alternativeLabel: true, activeStep: activeStep, connector: _jsx(CustomConnector, {}), children: linear.map((label) => (_jsx(Step, { children: _jsx(StepLabel, { StepIconComponent: CustomStepIcon, children: label }) }, label))) }), stepperNavigation()] }), _jsxs(Block, { bgTransparent: true, title: "Vertical Stepper", children: [_jsx(Stepper, { activeStep: verticalStep, orientation: "vertical", children: steps.map((step, index) => (_jsxs(Step, { children: [_jsx(StepLabel, { optional: index === 2 ? _jsx(Paragraph, { children: "Last step" }) : null, children: step.label }), _jsxs(StepContent, { children: [_jsx(Paragraph, { children: step.description }), _jsxs(Stack, { mt: 3, direction: "row", gap: 1, children: [_jsx(Button, { size: "small", onClick: handleVerticalNext, children: index === steps.length - 1 ? "Finish" : "Continue" }), _jsx(Button, { size: "small", variant: "text", color: "inherit", disabled: index === 0, onClick: handleVerticalBack, children: "Back" })] })] })] }, step.label))) }), verticalStep === steps.length && (_jsxs(Box, { bgcolor: isDark(theme) ? "grey.800" : "grey.50", borderRadius: 3, p: 3, mt: 3, children: [_jsx(Paragraph, { fontWeight: 500, mb: 2, children: "All steps completed - you're finished" }), _jsx(Button, { size: "small", onClick: handleVerticalReset, children: "Reset" })] }))] })] }));
};
export default MuiStepperPageView;
