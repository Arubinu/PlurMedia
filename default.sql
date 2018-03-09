CREATE TABLE IF NOT EXISTS categories (
  id integer(11) PRIMARY KEY NOT NULL,
  name varchar(255) NOT NULL,
  type varchar(50),
  path varchar(255),
  UNIQUE (name)
);

DELETE FROM categories;
INSERT INTO categories ( id, name, type, path ) VALUES ( 1, 'Films', 'film', 'Films' );

SELECT * FROM categories;

CREATE TABLE IF NOT EXISTS medias (
  id integer(11) PRIMARY KEY NOT NULL,
  category integer(11) NOT NULL,
  path varchar(255),
  name varchar(255),
  type varchar(255),
  date date,
  directed_by varchar(255),
  written_by varchar(255),
  studio varchar(255),
  actors text,
  description text
);

DELETE FROM medias;
INSERT INTO medias ( id, category, path, name, type, date, directed_by, written_by, studio, actors, description ) VALUES
( 1, 1, 'Code77.avi', 'The 7th Dimension', 'Horror, Sci-Fi', '2009-01-01', 'Brad Watson', 'Debbie Moon, Brad Watson', 'Revolt Films', '[["Kelly Adams","Sarah"],["Jonathan Rhodes","Declan"],["Lucy Evans","Zoe"],["Calita Rainford","Kendra"],["David Horton","Malcom"],["George Nicolas","Professeur / Présentateur"],["Cathy Murphy","Dame au sac"],["Wayne Lennox","Remote Viewer"],["Kris Tyler","Étudiant"],["Simon Thomas","Agresseur"]]', "Londres. Trois pirates informatiques essaient de pénétrer dans le serveur le plus complexe et sécurisé au monde, celui du Vatican, pour déverrouiller un code qui leur permettrait de lire la Bible en 4 dimensions afin de pouvoir prédire l'avenir. C'est alors qu'une série d'événements en apparence insignifiants libère une force surnaturelle à l'instinct meurtrier? Et si leur curiosité avait déclenché la fin du monde ?" ),
( 2, 1, 'Les Dissociés.mkv', 'Les Dissociés', 'Comedy', '2015-01-01', 'Raphaël Descraques', '', 'Suricate', '[["Raphaël Descraques","Sacha"],["Julien Josselin","Ben"],["Marsu Lacroix","Lily"],["Yoni Dahan","Gwen"],["Vincent Tirel","Magalie"],["Carlito","Chantal"],["Eléonore Costes","Léa"],["Thomas VDB","Serge"]]', "Un matin, Lily et ben se réveillent côte à côte dans des corps qui ne sont pas les leurs. Et Magalie, une petite fille dans le corps d'un grand barbu, les attend dans la chambre d'ami. C'est le début d'une aventure rocambolesque, parfois parcours initiatique, où les corps et les identités s'inverseront au gré d'une simple accolade." ),
( 3, 1, 'Cook Up a Storm.mp4', 'Cook Up a Storm', 'Drama', '2017-01-01', 'Raymond Yip Wai-Man', 'Manfred Wong', '', '[["Nicholas Tse","Gao Tian Ci"],["Anthony Wong","Antony Go"],["Ge You"],["Tiffany Tang"],["Bai Bing"],["Helena Law Lan"],["Jung Yong-hwa"],["Jim Chim"],["Du Haitao"],["Taili Wang"]]', "Un cuisinier de rue Cantonais et son principal rival, un chef étoilé Français, découvrent qu'ils ont beaucoup en commun pour préparer une compétition culinaire de renommée mondiale. Une compétition culinaire internationale devient un champ de bataille entre les deux rivaux, l'un célèbre pour sa cuisine de rue Cantonnaise et l'autre un chef étoilé formé en France. Mais leur rivalité prend un tournant inattendu quand ils découvrent un ennemi commun et combinent leurs compétences dans une fusion de l'Est et de l'Ouest." );

SELECT * FROM medias;
