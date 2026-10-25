const $=id=>document.getElementById(id);
const weatherCodes={
  0:['Clear sky','☀️'],1:['Mainly clear','🌤️'],2:['Partly cloudy','⛅'],3:['Overcast','☁️'],
  45:['Fog','🌫️'],48:['Depositing rime fog','🌫️'],51:['Light drizzle','🌦️'],53:['Drizzle','🌦️'],55:['Dense drizzle','🌧️'],
  56:['Freezing drizzle','🌧️'],57:['Freezing drizzle','🌧️'],61:['Slight rain','🌦️'],63:['Moderate rain','🌧️'],65:['Heavy rain','🌧️'],
  66:['Freezing rain','🌧️'],67:['Heavy freezing rain','🌧️'],71:['Slight snow','🌨️'],73:['Moderate snow','🌨️'],75:['Heavy snow','❄️'],
  77:['Snow grains','🌨️'],80:['Rain showers','🌦️'],81:['Rain showers','🌧️'],82:['Violent rain showers','⛈️'],85:['Snow showers','🌨️'],86:['Heavy snow showers','❄️'],
  95:['Thunderstorm','⛈️'],96:['Thunderstorm with hail','⛈️'],99:['Thunderstorm with hail','⛈️']
};
function weatherInfo(code){return weatherCodes[code]||['Conditions unavailable','🌡️'];}
function setStatus(message,isError=false){$('status').textContent=message;$('status').classList.toggle('error',isError);}
function safeNum(value,unit=''){return value==null?'—':`${Math.round(value)}${unit}`;}
function dayName(dateString){return new Intl.DateTimeFormat(undefined,{weekday:'short'}).format(new Date(dateString+'T12:00:00'));}
function renderWeather(place,current,daily){
  const [condition,icon]=weatherInfo(current.weather_code);
  const content=document.createElement('div');
  const grid=document.createElement('div');grid.className='weather-grid';
  const main=document.createElement('article');main.className='panel current-weather';
  const loc=document.createElement('div');loc.className='location';loc.textContent=[place.name,place.admin1,place.country].filter(Boolean).join(', ');
  const temp=document.createElement('div');temp.className='temperature';temp.textContent=safeNum(current.temperature_2m,'°');
  const cond=document.createElement('div');cond.className='condition';cond.textContent=icon+'  '+condition;
  const feels=document.createElement('p');feels.textContent='Feels-like data is not provided in this view. Check the metrics on the right for current conditions.';
  main.append(loc,temp,cond,feels);
  const details=document.createElement('article');details.className='panel';const h=document.createElement('h3');h.textContent='Current details';details.append(h);
  const dg=document.createElement('div');dg.className='details-grid';
  [['Feels like','Not available'],['Wind speed',safeNum(current.wind_speed_10m,' km/h')],['Humidity',safeNum(current.relative_humidity_2m,'%')],['Cloud cover',safeNum(current.cloud_cover,'%')]].forEach(([label,value])=>{
    const d=document.createElement('div');d.className='detail';const s=document.createElement('span');s.textContent=label;const b=document.createElement('strong');b.textContent=value;d.append(s,b);dg.append(d);
  });
  details.append(dg);grid.append(main,details);content.append(grid);
  const forecastTitle=document.createElement('h3');forecastTitle.textContent='Next five days';forecastTitle.style.margin='28px 0 0';content.append(forecastTitle);
  const fg=document.createElement('div');fg.className='forecast-grid';
  daily.time.slice(0,5).forEach((date,i)=>{
    const [desc,ico]=weatherInfo(daily.weather_code[i]);const card=document.createElement('div');card.className='forecast-day';
    const day=document.createElement('div');day.className='day';day.textContent=i===0?'Today':dayName(date);
    const iconEl=document.createElement('div');iconEl.className='icon';iconEl.textContent=ico;
    const temps=document.createElement('strong');temps.textContent=`${safeNum(daily.temperature_2m_max[i],'°')} / ${safeNum(daily.temperature_2m_min[i],'°')}`;
    const small=document.createElement('small');small.textContent=desc;
    card.append(day,iconEl,temps,small);fg.append(card);
  });
  content.append(fg);$('weatherContent').replaceChildren(content);
}
async function loadWeather(city){
  const button=$('searchButton');button.disabled=true;button.textContent='Loading…';setStatus('Finding location and fetching forecast…');
  try{
    const geoUrl=new URL('https://geocoding-api.open-meteo.com/v1/search');
    geoUrl.search=new URLSearchParams({name:city,count:'1',language:'en',format:'json'});
    const geoResponse=await fetch(geoUrl);if(!geoResponse.ok)throw new Error('Location search failed. Please try again.');
    const geo=await geoResponse.json();if(!geo.results?.length)throw new Error('City not found. Check the spelling and try again.');
    const place=geo.results[0];
    const forecastUrl=new URL('https://api.open-meteo.com/v1/forecast');
    forecastUrl.search=new URLSearchParams({latitude:place.latitude,longitude:place.longitude,current:'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,wind_speed_10m',daily:'weather_code,temperature_2m_max,temperature_2m_min',timezone:'auto',forecast_days:'5'});
    const response=await fetch(forecastUrl);if(!response.ok)throw new Error('Weather service is temporarily unavailable. Please try again later.');
    const data=await response.json();if(!data.current||!data.daily)throw new Error('The weather service returned incomplete data.');
    renderWeather(place,data.current,data.daily);setStatus(`Updated just now · Local time ${new Intl.DateTimeFormat(undefined,{hour:'2-digit',minute:'2-digit',timeZone:data.timezone}).format(new Date())}`);
  }catch(error){
    setStatus(error.message==='Failed to fetch'?'Could not connect. Check your internet connection and try again.':error.message,true);
    $('weatherContent').replaceChildren();const empty=document.createElement('div');empty.className='weather-empty';empty.textContent='🌧️ We could not load this report. Your search is safe to retry.';$('weatherContent').append(empty);
  }finally{button.disabled=false;button.textContent='Search weather ↗';}
}
$('searchForm').addEventListener('submit',e=>{e.preventDefault();const city=$('cityInput').value.trim();if(city)loadWeather(city);});
loadWeather('Bhubaneswar');
