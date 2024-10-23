import { onMounted } from "vue";
import type { Graph } from "../useGraph";
import { DEFAULT_HIGHLIGHT_CLASS_NAME } from "./types";
import type {
  TutorialSequence,
  ElementHighlightOptions,
  GraphEventName,
} from "./types";

/**
 * creates functionality for an interactive tutorial sequence for a graph
 *
 * @param graph the useGraph instance to apply the tutorial to
 * @param tutorialSequence the sequence of tutorial steps to apply
 * @returns // TODO make it return controls for the tutorial
 */
export const useGraphTutorial = (graph: Graph, tutorialSequence: TutorialSequence) => {

  const h1 = document.createElement('h1');
  h1.style.opacity = '0'
  h1.style.width = '100%';
  h1.style.textAlign = 'center';
  h1.style.userSelect = 'none';
  h1.classList.add(
    'text-4xl',
    'text-center',
    'text-white',
    'font-bold',
    'absolute',
    'bottom-[10%]',
    'absolute',
    'transition-opacity',
    'duration-300',
  );

  const addText = (text: string) => {
    h1.innerText = text;
    h1.style.opacity = '1';
  }

  const removeText = () => {
    h1.style.opacity = '0';
  }

  const applyHighlight = (highlightInput: ElementHighlightOptions) => {
    const { highlightElement: highlight } = highlightInput;
    if (!highlight) return () => { };
    const {
      id,
      className,
    } = {
      id: typeof highlight === 'string' ? highlight : highlight.id,
      className: (typeof highlight === 'string' || !highlight?.className) ? DEFAULT_HIGHLIGHT_CLASS_NAME : highlight.className,
    };

    if (!id) return () => { };
    const element = document.getElementById(id);
    if (!element) throw new Error(`element with id ${id} not found`);

    element.classList.add(className);
    return () => element.classList.remove(className);
  }

  const nextStep = () => {
    const step = tutorialSequence.shift();

    if (!step) {
      removeText()
      setTimeout(h1.remove, 1000);
      return;
    }

    let currentHighlightRemover: () => void;

    setTimeout(() => {
      addText(step.hint);
      if (step?.highlightElement) currentHighlightRemover = applyHighlight(step);
    }, 1500);

    if (step.dismiss === 'onTimeout') {
      setTimeout(() => {
        removeText();
        nextStep();
      }, step.after);
      return;
    }

    const goNext = (eventName: GraphEventName) => {
      graph.unsubscribe(eventName, proceed);
      removeText();
      currentHighlightRemover?.();
      nextStep();
    }

    const proceed = (...args: any[]) => {
      if (typeof step.dismiss !== 'string') {
        const predicate = step.dismiss.predicate(...args);
        if (predicate) goNext(step.dismiss.event);
        return;
      }
      goNext(step.dismiss);
    }

    const dismissEvent = typeof step.dismiss === 'string' ? step.dismiss : step.dismiss.event;
    graph.subscribe(dismissEvent, proceed);
  }

  onMounted(() => {
    if (!graph.canvas.value) throw new Error('canvas element not found in dom');
    const parent = graph.canvas.value.parentElement;
    if (!parent) throw new Error('canvas parent element not found in dom');
    parent.appendChild(h1);
    nextStep();
  });
}