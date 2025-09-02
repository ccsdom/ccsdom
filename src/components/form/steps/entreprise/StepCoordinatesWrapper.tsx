import React from "react";
import StepCoordinates, { StepCoordinatesProps } from "../StepCoordinates";

/**
 * Wrapper autour de StepCoordinates.
 * Permet d'ajouter éventuellement des logiques ou décorations
 * sans modifier le composant de base.
 */
const StepCoordinatesWrapper: React.FC<StepCoordinatesProps> = ({
  data,
  onChange,
  onNext,
  onBack,
}) => {
  return (
    <StepCoordinates
      data={data}
      onChange={onChange}
      onNext={onNext}
      onBack={onBack}
    />
  );
};

export default StepCoordinatesWrapper;
