import { googleAI } from '@genkit-ai/googleai';
import { genkit } from 'genkit';

const ai = genkit({
    plugins: [googleAI({ apiKey: "DUMMY" })],
});

console.log("Registered models:");
// Accessing the registry to see what models are available
// This is a bit of a hack but helps debug naming
console.log(Object.keys(ai.registry.listLoadedResources()));
