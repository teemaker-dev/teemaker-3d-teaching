// ===== 概念注册表 =====
import type { Concept } from '../types';
import { gearTrainConcept } from '../templates/gearTrain';
import { crankSliderConcept } from '../templates/crankSlider';
import { camConcept } from '../templates/cam';
import { leadScrewConcept } from '../templates/leadScrew';
import { planetaryConcept } from '../templates/planetary';

export const CONCEPTS: Concept[] = [
  gearTrainConcept,
  crankSliderConcept,
  camConcept,
  leadScrewConcept,
  planetaryConcept,
];

export function getConcept(id: string): Concept {
  return CONCEPTS.find((c) => c.id === id) ?? CONCEPTS[0];
}
