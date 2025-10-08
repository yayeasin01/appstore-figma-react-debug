# Hero IO – App Store (Figma → React)

A ready-to-run React + Vite + Tailwind project that matches your Figma spec:
- Header with logo (home), nav (`home`, `apps`, `installation`) + active state, and **Contribute** button to GitHub
- Custom footer
- JSON dataset (16 apps)
- Home banner + states + Top Apps (4-col) with **Show all**
- All Apps: title/subtitle, total count, **live search** (case-insensitive), **sort by downloads** (High→Low, Low→High), No App Found state
- App Details: image, info, **Install** (localStorage) + success toast, **Recharts** chart, description
- My Installation: list installed apps, **Uninstall** + toast
- 404 page
- Loading spinner on navigation & search
- HashRouter so deployed reloads don’t 404

## Get started
```bash
npm i
npm run dev
```
Open http://localhost:5173

> Replace `https://github.com/yourname` in Header with your GitHub profile.
> Swap placeholder images with real ones or keep the seeded picsum links.
