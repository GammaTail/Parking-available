import express from "express"
import bodyParser from "body-parser"
import session from "express-session";
import pg from "pg"
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json());

app.use(session({
    secret: 'xxxx',
    resave: false,
    saveUninitialized: true
}));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "mappy",
    password: "xxxx",
    port: 5432,
});

db.connect();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    console.log('Calculated Distance:', distance); 
    return distance;
}

app.get("/", async (req, res) => {
    const result = await db.query("SELECT * FROM locate WHERE name = $1", ['hello'])
    try{
        if (result.rows.length > 0 ){
            const user = result.rows[0]
            const lon = user.longitude
            const lat = user.latitude
            res.render("add", {lat: lat, lon: lon});
        }
    } catch (err) {
        console.log(err)
    }
})

app.get("/selected-location", (req, res) => {
    res.redirect("/locations")
})

app.get('/locations', async (req, res) => {
    
    const latitude = parseFloat(req.session.latitude);
    const longitude = parseFloat(req.session.longitude);
    console.log('Latitude:', latitude);
    console.log('Longitude:', longitude);
    const radius = 5;

    try {
        const result = await db.query('SELECT * FROM locate');
        const locations = result.rows; 

        console.log('All locations:', locations); 

        const locationsWithinCircle = locations.filter(location => {
            const distance = calculateDistance(latitude, longitude, location.latitude, location.longitude);
            console.log('Location:', location);
            console.log('Distance:', distance);
            return distance <= radius;
        });

        console.log('Places within the circle:', locationsWithinCircle);
        const filteredLocations = locationsWithinCircle.map(location => {
            return {
                name: location.name,
                latitude: location.latitude,
                longitude: location.longitude
            };
        });

        console.log('Filtered Locations:');
        filteredLocations.forEach(location => {
            console.log(location.name);
        });

        res.render("new", { filteredLocations });

    } catch (error) {
        console.error('Error executing query:', error);
    } 
});

app.post("/selected-location", (req, res) => {
    const { latitude, longitude, displayName } = req.body;
    req.session.latitude = latitude
    req.session.longitude = longitude
    req.session.displayName = displayName

    res.redirect("/locations")
});

app.listen(port, () => {
    console.log(`Server listening at port ${port}.`);
});