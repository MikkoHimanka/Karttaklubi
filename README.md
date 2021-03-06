# Karttaklubi
![Karttaklubi](/karttaklubi.png)

Karttaklubin avulla käyttäjät voivat luoda karttoja yhteistyön voimin.
Sovellusta voi käyttää osoitteessa https://karttaklubi.herokuapp.com/

## Karttasovellus
* Sovelluksessa on käyttäjiä, karttoja ja kartan osia.
* Käyttäjät voivat luoda karttoja ja muokata niitä ja niiden osia.
* Käyttäjät voivat antaa toisille käyttäjille oikeuden muokata karttojaan.
* Yhtä kartan osaa voi muokata vain yksi henkilö kerrallaan.
* Kartoissa voi muokata maaston korkeutta ja lisätä objekteja (esim. taloja, puita)
* Jokaisella kartalla ja kartan osalla on oma keskusteluketju
![havainnollistava esimerkki](/esim1.png)

## Sovelluksen tilanne
* Sovellukseen voi luoda uusia tunnuksia ja kirjautua niillä sisään
* Voit lähettää muille käyttäjille kaveripyyntöjä (merkkikokoriippuvainen) ja hyväksyä/hylätä sinulle lähetettyjä pyyntöjä
* Voit luoda tietokantaan uusia karttoja ja halutessasi jakaa niitä kavereidesi tai kaikkien kanssa
* Kartat koostuvat yhdestä tai useammasta alikartasta ja niitä voi halutessaan tehdä lisää
* Jokaista alikarttaa voi muokata yksi käyttäjä kerrallaan. Tämä on toteuttu niin, että muokkaavan käyttäjän selain lähettää tietyin väliajoin "pulssin" palvelimelle mikä pitä kartan osan lukittuna muilta. Kun käyttäjä poistuu muokkaussivulta ja pulssi katoaa, kartan osa palautuu muiden muokattavaksi hetken kuluttua.
* Jokaisella kartalla ja alikartalla on oma pieni keskustelualueensa missä käyttäjät voivat kommunikoida keskenään
* Kartan muokkaussivulta löytyy HTML canvas -elementti jonka avulla kartan datan muokkaaminen tapahtuu. Sivun alalaidasta löytyvät kontrollit muokkaamista varten, jotka ovat monille varmasti tuttuja esimerkiksi Photoshopin kaltaisista kuvankäsittely sovelluksista.
* Kartat perustuvat puhtaasti korkeusdataan. Sovellus laskee tuon datan perusteella kartan värit ja pinnan normaalin (arvion) perusteella yksinkertaisen varjostuksen.
* Painalla "SHIFT" -näppäintä pohjassa karttaa voi tasoittaa. "CTRL" -näppäin toimii pikanäppäimenä kaivertamiselle

* Sovelluksesta jäi puuttumaan objektien lisäys -ominaisuus alkuperäisestä suunnitelmasta