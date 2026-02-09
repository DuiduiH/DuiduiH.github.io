# CV Game 🎮

A visually interactive personal CV/portfolio website built with vanilla JavaScript, featuring gamified sections for introducing yourself in a creative and engaging way.

## Features

### 1. Who Am I? (第一部分)

- **1.1 关于兴趣 (Interest Flip Game)** — Memory card game with interest categories and descriptions
- **1.2 关于事业 (Career Path)** — Interactive money bag and egg animations revealing career experiences
- **1.3 关于学习 (Knowledge Bubbles)** — Floating bubbles with particle effects that reveal learning topics and descriptions
- **1.4 我与世界 (World Map)** — Interactive world map built with Leaflet.js showing places visited and languages spoken

### 2. 基本信息 (Basic Info)

- **2.1 学业** (Education) — Timeline view of educational background
- **2.2 工作** (Work Experience) — Career timeline
- **2.3 项目** (Projects) — Notable projects and contributions
- **2.4 文化** (Cultural Activities) — Personal cultural experiences
- **2.5 荣誉** (Honors & Awards) — Achievements and recognition
- **2.6 技能树** (Skill Tree) — Interactive SVG skill tree with persistent localStorage state

### 3. Takeaway

- **3.1 联系方式** (Contact Info) — How to reach you
- **3.2 最后一句话** (Final Words) — Your parting message

## Tech Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 with CSS variables for theming
- **Mapping**: Leaflet.js (optional, with fallback to simple DOM-based markers)
- **State Persistence**: localStorage for skill tree progress
- **Build**: No build step required; runs directly in browser

## Project Structure

```
CVgame/
├── index.html              # Semantic HTML markup
├── css/
│   └── style.css          # All styling (650+ lines, organized by component)
├── js/
│   ├── main.js            # Core initialization, game board, career section
│   ├── spores.js          # Knowledge bubbles subsystem with particle effects
│   └── map-and-skills.js  # World map (Leaflet) and skill tree logic
├── README.md              # This file
├── LICENSE                # MIT License
└── .gitignore            # Git ignore rules
```

## Getting Started

### Option 1: Direct File Open (Easiest)
Simply open `index.html` in your web browser:
```bash
open index.html
```

### Option 2: Local HTTP Server (Recommended)
For better loading performance and Leaflet map functionality:

**Using Python 3:**
```bash
cd /path/to/CVgame
python3 -m http.server 8081
```
Then navigate to `http://localhost:8081` in your browser.

**Using Python 2:**
```bash
python -m SimpleHTTPServer 8081
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8081
```

## Customization

### Edit Content
- Open `index.html` and update placeholder text in each section
- Add your personal information, dates, and descriptions

### Customize Colors
- Edit CSS variable values in [css/style.css](css/style.css#L1-L20):
  ```css
  :root {
    --tencent-blue: #0066ff;
    --primary: #003d99;
    --accent: #3388ff;
    /* ... etc */
  }
  ```

### Modify Game Content
- **Flip Game**: Edit `GAME_ITEMS` in [js/main.js](js/main.js)
- **Bubbles**: Edit `SPORES_DATA` in [js/spores.js](js/spores.js)
- **World Map**: Update `PLACES` array in [js/map-and-skills.js](js/map-and-skills.js)
- **Skill Tree**: Modify skill node structure in SVG and JS logic in [js/map-and-skills.js](js/map-and-skills.js)

## Features in Detail

### Game Board (1.1)
- 20 interest pairs displayed as 40 cards in a 5×8 grid
- Click to flip cards and match pairs
- Cards stay revealed when matched
- Status counter shows progress

### Career Section (1.2)
- **Money Bag**: Click to spill 4 coins with animations
- **Egg**: Click to crack open and reveal a cloud with startup name
- **Hover Effects**: Dynamic tooltips on interactions
- **Company Display**: Shows company name on overlay

### Knowledge Bubbles (1.3)
- **8 Topic Categories**: 
  - Product & Business
  - Technology Basics
  - Social Economics
  - Culture & Media
  - Creativity & Art
  - Music & Harmony
  - Learning & Growth
  - Future Trends
- **Interactive**: Click any bubble to see a term and description
- **Particle Effects**: Clicking bubbles creates particle explosions
- **Smooth Animations**: Bubbles float continuously with sine-wave drift

### World Map (1.4)
- **Interactive Mapping**: 8 preset locations (Beijing, London, Paris, NYC, SF, Tokyo, Sydney, Singapore)
- **Zoom Controls**: +/− buttons and reset view
- **Filter Toggles**: Show/hide "visited" and "language spoken" markers
- **Fallback Mode**: If Leaflet unavailable, uses simple DOM-based marker system

### Skill Tree (2.6)
- **Progressive Unlocking**: Child skills require root skill to be lit
- **Persistent State**: localStorage saves your progress even after page reload
- **Reset Button**: Dynamically added to section for clearing progress
- **Visual Feedback**: Lit nodes glow, unlit nodes are muted

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Requires ES6 support and localStorage

## Performance Notes

- **First Load**: ~2 MB with Leaflet CDN (Leaflet ~150 KB)
- **Local Assets**: CSS + JS files are minified-ready
- **Canvas Rendering**: Particle effects use requestAnimationFrame for smooth 60 FPS
- **localStorage**: Skill tree state saves instantly (~500 bytes)

## Deployment

### GitHub Pages
1. Create a new repository named `CVgame`
2. Push this folder to the `main` branch:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/CVgame.git
   git push -u origin main
   ```
3. Enable GitHub Pages in repository settings (Pages > Branch: main)
4. Your site will be live at `https://YOUR_USERNAME.github.io/CVgame/`

### Custom Domain
- Update GitHub Pages settings to use your custom domain
- Add a CNAME file with your domain name

## License

This project is licensed under the MIT License — see [LICENSE](LICENSE) for details.

## Contributing

Feel free to fork, modify, and adapt this project for your own use. If you create improvements, consider sharing them back!

## Tips for Best Results

1. **Use Modern Browser**: For best visual effects, use Chrome or Firefox
2. **Enable JavaScript**: All interactivity requires JavaScript enabled
3. **Local Server**: For development, use a local HTTP server to avoid CORS issues
4. **Mobile Friendly**: CSS includes responsive rules for smaller screens
5. **Performance**: Keep asset sizes in mind; consider CDN for production

---

**Made with ❤️ for creative self-presentation**
