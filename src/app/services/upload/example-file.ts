export const exampleContent = `.type run
.events
t1 | Reiseziel auswählen
t2 | Flug buchen
t3 | Hotel buchen
t4 | Flug stornieren
t5 | Flug buchen
Verreisen
.arcs
t1 t2
t2 t4
t4 t3
t4 t5
t5 t3
t5 Verreisen
Verreisen t3
`;
