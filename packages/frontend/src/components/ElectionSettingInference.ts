import archive_settings from './public_archive_settings.yaml';
import { StringObject } from './util';

export const inferElectionSettings = (file_name: string): Object => {
    // get meta from filename
    let name = file_name.split('.')[0];
    let [jurisdiction, date, race] = name.split('_');
    let year = date.slice(4);
    let state = Object.keys(archive_settings.states).find(state =>
        jurisdiction === state || archive_settings.states[state].includes(jurisdiction)
    )

    if(state == undefined) throw `Couldn't infer state from ${file_name}`
    let meta = {jurisdiction, date, race, year: year, state, name}

    let inferences = archive_settings.rules.find(rule => ruleMatch(rule.rule, meta));
    inferences.meta = {...meta, ...inferences.meta}

    return inferences
}

const ruleMatch = (ruleExpression: string, meta: StringObject): boolean => {
    let rules = ruleExpression.split(', ');
    return rules.every(rule => {
        const ops: [string, Function][] = [
            ['<=', (key, value) => Number(meta[key]) <= Number(value)],
            ['>=', (key, value) => Number(meta[key]) >= Number(value)],
            ['=', (key, value) => meta[key] === value],
            [' contains ', (key, value) => meta[key].includes(value)],
        ];
        for(let i = 0; i < ops.length; i++){
            let [op, func] = ops[i];
            if(!rule.includes(op)) continue;
            return func(...rule.split(op))
        }
    })
}