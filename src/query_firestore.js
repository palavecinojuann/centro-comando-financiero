import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../firebase-applet-config.json'), 'utf8'));
const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function dumpData() {
  const ID_HOGAR = 'hogar_bimont_central';
  const subcollections = [
    'ingresos_principales',
    'gastos_vitales',
    'janlu_bridge',
    'debts',
    'cofres',
    'categorias'
  ];

  const results = {
    hogarId: ID_HOGAR,
  };

  for (const sub of subcollections) {
    try {
      const colRef = collection(db, 'hogares', ID_HOGAR, sub);
      const snap = await getDocs(colRef);
      results[sub] = snap.docs.map(doc => {
        const data = doc.data();
        const processedData = {};
        for (const key of Object.keys(data)) {
          if (data[key] && typeof data[key] === 'object' && typeof data[key].toDate === 'function') {
            processedData[key] = data[key].toDate().toISOString();
          } else {
            processedData[key] = data[key];
          }
        }
        return { id: doc.id, ...processedData };
      });
    } catch (e) {
      results[sub] = { error: e.message };
    }
  }

  console.log('---START_DUMP---');
  console.log(JSON.stringify(results, null, 2));
  console.log('---END_DUMP---');
}

dumpData().catch(console.error);
