import { jsx as _jsx } from "react/jsx-runtime";
import StepCoordinates from "../StepCoordinates";
/**
 * Wrapper autour de StepCoordinates.
 * Permet d'ajouter éventuellement des logiques ou décorations
 * sans modifier le composant de base.
 */
const StepCoordinatesWrapper = ({ data, onChange, onNext, onBack, }) => {
    return (_jsx(StepCoordinates, { data: data, onChange: onChange, onNext: onNext, onBack: onBack }));
};
export default StepCoordinatesWrapper;
