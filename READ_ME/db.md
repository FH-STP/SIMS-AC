# Database Struktur

## Table: User

Für Benutzer

| ID | Username | Password Hash | PW-Salt | Berechtigungen/Is_Admin |

Entweder Bool für Admin / oder String oder ID Um komplexere Gruppen zu ermöglichen

## Table: Incidents

| ID | Owner | Title | API_Text | Creation_Time | Severity | Status | Conclusion_Text or Notes_Text | Conclusion_ID | Creator |

API_Text - Zusätzliche Daten welche Per API übergeben werden wie Text "System XYZ wurde von Virus Shai Hulud angegriffen"

Conclusion_Text or Notes_Text: Zum Beschreiben wie die Situation aussieht befüllt von Benutzern

Conclusion_ID --> Dropdown mit auswahl vordefinierter conclusion wie "Malware" "Security Testing" "False Positiv"

## Table: Linking

Zum Verlinken von incidents miteinander

| ID_Main_Incident | Sub_Incident |

## Table: Conclusion_ID

Zum Verlinken von incidents miteinander

| Conclusion_ID | Text | True Positiv | Informational |
