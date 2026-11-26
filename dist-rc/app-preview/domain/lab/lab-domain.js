// P2.10 — builds the chemistry authorities a lab runtime orchestrates from the raw pack data, exactly as the
// existing practice session does (features/practice/session.ts): same parsers, same solution-mixing context.
import {ReactionMatcher} from '../chemistry/reaction-matcher.js';
import {IonicEngine} from '../chemistry/ionic-engine.js';
import {SpeciesRegistry} from '../chemistry/species-registry.js';
import {ElectrolysisModel} from '../chemistry/electrolysis-model.js';
import {parseConditionVocabulary} from '../chemistry/condition-vocabulary.js';
                                                

                                                                                                                                                   
                                                                                                                    
                                          

export function createLabDomain(data                 )          {
  const species=SpeciesRegistry.from((Array.isArray(data.species)?data.species:(data.species       )?.species)       );
  const vocabulary=data.conditionVocabulary?parseConditionVocabulary(data.conditionVocabulary):undefined;
  const matcher=ReactionMatcher.from(data.reactions       ,vocabulary?{vocabulary}:{});
  const ionicEngine=IonicEngine.from({reactions:data.reactions       ,rules:data.solutionRules       });
  const mixing=vocabulary?.contexts['solution-mixing'];
  const reviewedReactionIds                    =new Set(Array.isArray(data.reviewedReactionIds)?data.reviewedReactionIds:[]);
  return {
    species,ionicEngine,matcher,reviewedReactionIds,
    ionic:{species,matcher,ionic:ionicEngine,reviewedReactionIds,...(mixing?{mixingConditions:{dimensions:{...mixing.dimensions}}}:{})},
    ...(data.electrolysis?{electrolysis:ElectrolysisModel.from(data.electrolysis)}:{}),
    // the indicator record travels with the hydrolysis data (hydrolysis.json#indicator); only valid colours are kept
    ...((data       ).hydrolysis?.indicator?.colors?{indicator:{id:String((data       ).hydrolysis.indicator.id),colors:Object.fromEntries(Object.entries((data       ).hydrolysis.indicator.colors).filter(([m,c])=>['acidic','basic','neutral'].includes(m)&&typeof c==='string'))}}:{}),
  };
}
