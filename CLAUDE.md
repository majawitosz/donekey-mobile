# donekey-mobile/ — aplikacja mobilna dla pracownika

Expo 54 / React Native 0.81 / expo-router 6 / reanimated 4; TypeScript. Pracownik deklaruje dostępność tygodniową i rejestruje obecność (check-in/out z GPS). Mapa systemu: [../CLAUDE.md](../CLAUDE.md). Specyfikacja obecności: [../docs/features/attendance.md](../docs/features/attendance.md).

Ten plik ładuje się przy pracy w module — tylko reguły, które łatwo złamać niechcący.

## Komendy

```powershell
npm install
npm start            # expo start (Metro)
npm run android      # expo run:android — używa katalogu android/ w repo
npm run ios
npm run web          # expo start --web
npm run lint
```
Brak skryptu `test` — repo nie ma testów.

Katalog `android/` jest w repo (workflow bare/prebuild). Zmiana pluginów w `app.json` (np. `expo-location`) wymaga `npx expo prebuild` i świadomej decyzji, bo nadpisze `android/`. `eas.json` definiuje profile buildów; `extra.eas.projectId` wiąże projekt z EAS.

## Mapa

| Ścieżka | Zawiera |
|---|---|
| `app/_layout.tsx` | `AuthProvider` + `ThemeProvider` + `Stack` (`auth`, `(tabs)`, `modal`) |
| `app/(tabs)/_layout.tsx` | guard: brak `isAuthenticated` → `<Redirect href="/auth" />`; zakładki Home i Dyspo |
| `app/(tabs)/index.tsx` | check-in/out: pobiera `/workplace/config/`, `/attendance/status/`, wysyła `/attendance/event/` |
| `app/(tabs)/explore.tsx` | dostępność tygodniowa (nawigacja po tygodniach), `GET/POST .../availability/*` |
| `app/auth/{index,login,register,register-company}.tsx` | wejście do logowania/rejestracji firmy i pracownika |
| `providers/auth-provider.tsx` | stan sesji + AsyncStorage |
| `hooks/use-location.ts` | uprawnienia, `getCurrentPositionAsync`, haversine, geofence |
| `components/attendance-control.tsx` | przycisk check-in/out i obsługa lokalizacji |
| `constants/theme.ts` | kolory i fonty motywu (jasny/ciemny) |

## Niezmienniki

- **Token: `AsyncStorage['@auth/token']`, profil: `AsyncStorage['@auth/user_v2']`.** Powód: `AuthProvider` używa klucza `@auth/user_v2` i czyści stary `@auth/user`; dodanie kolejnego klucza bez migracji zostawia „zalogowanego" użytkownika bez tokenu. Ekrany czytają token bezpośrednio z AsyncStorage (nie z providera).
- **Dwie bazy API: `EXPO_PUBLIC_API_URL` = `…/api/accounts`, `EXPO_PUBLIC_API_URL_V2` = `…/api/schedule`.** Powód: w kodzie doklejane są tylko końcówki (`/login`, `/attendance/...`, `/availability/...`); użycie złej bazy daje 404 z innego modułu.
- **`EXPO_PUBLIC_*` jest wbudowywane w bundle przy buildzie.** Powód: zmiana `.env` wymaga restartu Metro (`npm start -- --clear`) lub nowego builda; te zmienne nie są sekretami.
- **Brak odświeżania tokenu.** Powód: access żyje 120 min, potem API zwraca 401 i użytkownik loguje się ponownie (BACKLOG P1). Nie dodawaj „cichego" retry bez odświeżania.
- **Geofence liczony lokalnie to tylko UX.** Powód: `isWithinGeofence` decyduje, czy pokazać przycisk; ważność zdarzenia ocenia backend (`accounts/views.py`). Nie przenoś tej decyzji do klienta.
- **Nazwa `donekey-` jest zamrożona** (`app.json`: `slug`, `scheme: donekeymobile`, `package: com.majawitosz.donekeymobile`). Powód: opublikowana konfiguracja EAS; zmiana psuje deep-linki i wymaga nowej aplikacji.
- **Typowane trasy (`typedRoutes: true`).** Powód: `Href` z `expo-router` wymusza poprawny string; `as Href` w kodzie omija sprawdzanie — nie kopiuj tego wzorca bez potrzeby.

## Pułapki

- `app/(tabs)/_layout.tsx` sprawdza tylko `isAuthenticated` z AsyncStorage (nie ważność tokenu) — wygasły token prowadzi do ekranu, który sypie błędami 401.
- `.env` w repo wskazuje **produkcję** (`https://donkey.todayautomate.com/...`). Praca z lokalnym backendem wymaga ręcznej zmiany obu zmiennych na IP hosta (nie `localhost` — telefon nie rozwiąże hosta) i restartu Metro.
- `app/auth/register-company.tsx` ma fallback `'http://localhost:3000'` (port frontu!) gdy brak `EXPO_PUBLIC_API_URL` — nie kopiuj tego wzorca.
- `app/auth/login.tsx` próbuje `/users/me/`, a potem `/auth/user/`; oba mogą nie istnieć w backendzie — logowanie ma działać także wtedy, gdy w odpowiedzi `/login` jest komplet użytkownika.
- Interfejs jest po polsku na sztywno (brak i18n) — nowe teksty pisz po polsku, nie dodawaj biblioteki tłumaczeń bez decyzji.
- `react-native-reanimated` 4 + `react-native-worklets` wymagają zgodności wersji; aktualizacja jednego bez drugiego psuje build Androida.
- `app.json` ma `newArchEnabled: true` i `reactCompiler: true` — błędy kompilacji React Compilera nie zawsze wskazują właściwe miejsce; sprawdź `npx expo-doctor`.
