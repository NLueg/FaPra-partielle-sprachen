export const exampleContent = `.type run
.events
Reiseziel auswählen | t1
Flug buchen | t2
Hotel buchen | t3
Flug stornieren | t4
Flug buchen | t5
Reise antreten | t6
.arcs
t1 t2
t2 t4
t4 t3
t4 t5
t5 t3
t5 t6
t6 t3
`;
