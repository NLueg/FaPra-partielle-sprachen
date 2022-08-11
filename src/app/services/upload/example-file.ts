export const exampleContent1 = `.type run
.events
1 | Reise planen
2 | Prüfen
6 | Flug suchen
7 | Flug buchen
8 | Hotel suchen
9 | Hotel buchen
10 | Unterlagen speichern
.arcs
1 2
2 6
2 8
6 7
7 10
8 9
9 10
`;

export const exampleContent2 = `.type run
.events
1 | Reise planen
2 | Prüfen
3 | Änderung anfordern
4 | Reise planen
5 | Prüfen
11 | Flug suchen
12 | Flug buchen
13 | Hotel suchen
14 | Hotel buchen
15 | Unterlagen speichern
.arcs
1 2
2 3
3 4
4 5
5 11
5 13
11 12
12 15
13 14
14 15
`;
