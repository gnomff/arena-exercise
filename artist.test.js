'use strict';


const highland = require('highland');
const fp = require('lodash/fp');
const combinatorics = require('js-combinatorics');
const {main, doCombos, findCommonCombinations, combinations} = require('./arena');
const reduce = require('lodash/fp/reduce').convert({ 'cap': false });

describe('Functional Tests', function() {

  let fs;

  beforeEach(() => {
    //reset all the mocks
    jest.resetModules()
        .resetAllMocks()
        .mock('fs', () => new (require('metro-memory-fs'))());
    fs = require('fs');
  });

  test.only(`Given a file with a,b,c
        when program is executed
        and threshold is 0
        then result is ['a,b', 'a,c', 'b,c']`, async function (){
    
    fs.writeFileSync('/oneline.txt', 'a,b,c');
    await main(fs)('/oneline.txt', '/output.txt', 0).then(() => {
      const result = fs.readFileSync('/output.txt', 'utf-8');
      expect(result).toBe(`b,c\na,b\na,c\n`)
    });
  });

  test.only(`Given ['a,b,c']
        when main is run
        and threshold is 0
        then result is ['a,b', 'a,c', 'b,c']`, async function (){

    await findCommonCombinations(0)(highland(['a,b,c'])).collect().toPromise(Promise).then((result) => {
      expect(result).toIncludeAllMembers(['a,b', 'a,c', 'b,c'])
    });
  });

  test.only(`Given ['a,b,c', 'a,b,c']
        when main is run
        and threshold is 1
        then result is ['a,b'], ['a,c'], ['b,c']`, async function (){

    await findCommonCombinations(1)(highland(['a,b,c', 'a,b,c'])).collect().toPromise(Promise).then((result) => {
      expect(result).toIncludeAllMembers(['a,b', 'a,c', 'b,c'])
    });
  });

  test(`Given ['a,b,c', 'a,b,c']
        when main is run
        and threshold is 3
        then result is []`, async function (){

    await main(highland(['a,b,c', 'a,b,c']), 3).collect().toPromise(Promise).then((result) => {
      expect(result).toStrictEqual([])
    });
  });

  test(`Given ['a,b,c', 'd,e,f']
        when main is run
        and threshold is 2
        then result is []`, async function (){

    await main(highland(['a,b,c', 'd,e,f']), 2).collect().toPromise(Promise).then((result) => {
      expect(result).toStrictEqual([])
    });
  });

  test(`Given ['a,b,c', 'a,b,e']
        when main is run
        and threshold is 2
        then result is ['a,b']`, async function (){

    await main(highland(['a,b,c', 'a,b,e']), 2).collect().toPromise(Promise).then((result) => {
      expect(result).toStrictEqual(['a,b'])
    });
  });

  test(`Given ['a,b,c', 'a,b,e', 'a,c,e']
        when main is run
        and threshold is 2
        then result is ['a,b', 'a,c', 'a,e']`, async function (){

    await main(highland(['a,b,c', 'a,b,e', 'a,c,e']), 2).collect().toPromise(Promise).then((result) => {
      expect(result).toStrictEqual(['a,b', 'a,c', 'a,e'])
    });
  });

  test(`Given ['a,b,c', 'a,b,e', 'a,c,e']
        when main is run
        and threshold is 2
        then result is ['a,b', 'a,c', 'a,e']`, async function (){

    await main(highland(['a,b,c', 'a,b,e', 'a,c,e']), 2).collect().toPromise(Promise).then((result) => {
      expect(result).toStrictEqual(['a,b', 'a,c', 'a,e'])
    });
  });

  test(`Given the first two lines of the sample file
      when main is run
      and threshold is 2
      then result is [Jason Mraz,Lady Gaga]`, async function (){
    const values = [
      'Michael Bublé,Jason Mraz,光田康典,The National,Sarah McLachlan,Claude Debussy,Lady Gaga,周杰倫,植松伸夫,Indochine,Rise Against,City and Colour,Radiohead,Red Hot Chili Peppers,Alexisonfire,Bebo & Cigala,The Mars Volta,Chick Corea & Hiromi,Theory of a Deadman,Cantaloupe Island,Adam\'s Apple,A Brighter Day,Afrodisia,Mambo De La Pinta,Greg Osby,James Newton,Testify,Art Blakey,Caravan,Tsuyoshi Sekito,Mira,Temptation,A Night In Tunisia,Serj Tankian,Winter,Duke Pearson,Cantaloop (Flip Fantasia),Cæcilie Norby,El Cumbanchero,You Don\'t Know What Love Is,Death Letter,Art Taylor,Closer to Home,Indio Gitano,Solomon Ilori and his Afro-Drum Ensemble,Black Byrd,Far West,Hi-Heel Sneakers,Congalegra,There Is The Bomb',
      'The Beatles,Chase Coy,Stephen Jerzak,nevershoutnever!,Taylor Swift,The Maine,All Time Low,Boys Like Girls,McFly,Owl City,Glee Cast,Brokencyde,Ke$ha,Relient K,Cobra Starship,Jason Mraz,Across The Universe Soundtrack,Romance On A Rocketship,Hellogoodbye,Avril Lavigne,Show Me The Skyline,Hey Monday,Sterling Knight,Kate Nash,Plain White T\'s,Breathe Carolina,Parachute,HEVO84,Stereo Skyline,Mika,The Weird Sisters,The Kooks,The Scene Aesthetic,Lady Gaga,Fake Number,High School Musical 3,3OH!3,Devon Werkheiser,Bring Me The Horizon,Dear Juliet,Replace,Phoebe Buffay,Son of Dork,Vampire Weekend,blink-182,A Rocket To The Moon,Oasis,John Williams,Miley Cyrus,Lady Antebellum']
    await main(highland(values), 2).collect().toPromise(Promise).then((result) => {
      expect(result).toStrictEqual(['Jason Mraz,Lady Gaga'])
    });
  });



  /**
   * BAD DO NOT USE, ONLY HERE TO DEMONSTRATE THAT IT IS BROKEN
   * @param {[string]} list 
   */
  const generateCombinations = (list) => combinatorics.combination(list, 2).toArray()

  const generateChars = (start = 'a'.charCodeAt(0), end = 26) => fp.map(i => String.fromCharCode(i + start), fp.range(0, end))

  test(`js-combinatorics is good at small numbers of items :)`, function(){
    const badcombos = generateCombinations(generateChars('a'.charCodeAt(0), 26))
    console.log(badcombos)
    const goodcombos = combinations(generateChars('a'.charCodeAt(0), 26));
    console.log(goodcombos)
    expect(badcombos.length).toEqual(goodcombos.length)
  });

  test(`js-combinatorics is broken for large numbers of items >:(`, function(){
    const badcombos = generateCombinations(generateChars('a'.charCodeAt(0), 50))
    const goodcombos = combinations(generateChars('a'.charCodeAt(0), 50));
    expect(badcombos.length).not.toEqual(goodcombos.length)
  });

  test(`Given 50 items
             When doCombos is run
             then the correct number of items is generated (𝐶(50,2) = 1225)`, function(){
    const goodcombos = combinations(generateChars('a'.charCodeAt(0), 50));
    expect(goodcombos.length).toBe(1225)
  });

});

describe('mycombos test', function() {
  test.only('combo test', function() {
    const list = ['a', 'b', 'c', 'd', 'e']
    const a = combinations(list)
    expect(a).toIncludeAllMembers([
      ['a', 'b'], 
      ['a', 'c'], 
      ['a', 'd'],
      ['a', 'e'],
      ['b', 'c'], 
      ['b', 'd'], 
      ['b', 'e'],
      ['c', 'd'], 
      ['c', 'e'], 
      ['d', 'e']
    ]);
  })
})

