let config = require('../config.json')

//-----------LOGIN---------------------
let xmlLogin = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ifx="http://ifx.ru/IFX3WebService">
<soap:Header/>
<soap:Body>
   <ifx:osmreq>
      <ifx:mbci>client1</ifx:mbci>
      <ifx:mbcv>1.0</ifx:mbcv>
      <ifx:mbh>OnlyHeadline</ifx:mbh>
      <ifx:mbl>${config.username}</ifx:mbl>
      <ifx:mbla>ru-RU</ifx:mbla>
      <ifx:mbo>Windows</ifx:mbo>
      <ifx:mbp>${config.password}</ifx:mbp>
      <ifx:mbt></ifx:mbt>
   </ifx:osmreq>
</soap:Body>
</soap:Envelope>
`

//----------GET PRODUCTS----------------------
const xmlProducts = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header/>
  <soap:Body/>
</soap:Envelope>`

//------------------GET NEWS--------------------
xmlGetNews = (updateMarker) => {
  return `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ifx="http://ifx.ru/IFX3WebService" xmlns:arr="http://schemas.microsoft.com/2003/10/Serialization/Arrays">
  <soap:Header/>
  <soap:Body>
     <ifx:grnbpsmreq>
        <ifx:direction>0</ifx:direction>
        <ifx:mbcid></ifx:mbcid>
        <ifx:mblnl>8000</ifx:mblnl>
        <ifx:mbsup>${updateMarker}</ifx:mbsup>
        <ifx:sls>
           <arr:string>?</arr:string>
        </ifx:sls>
     </ifx:grnbpsmreq>
  </soap:Body>
  </soap:Envelope>`
}

//-----------------GET RUBRICS------------------------
const xmlGetRubrics = `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header/>
  <soap:Body/>
</soap:Envelope>`

//----------------GET BY ID------------------------------
xmlGetNewById = (id) => {
  return `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns="http://ifx.ru/IFX3WebService">
  <soap:Header/>
  <soap:Body>
     <genmreq>
        <mbnid>${id}</mbnid>
     </genmreq>
  </soap:Body>
  </soap:Envelope>`
}

//-------------------GET BY PRODUCT---------------------------
xmlGetNewsByProduct = (id) => {
  return `<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:ifx="http://ifx.ru/IFX3WebService">
  <soap:Header/>
  <soap:Body>
     <ifx:grnbpmreq>
        <ifx:direction>0</ifx:direction>
        <ifx:mbcid>${id}</ifx:mbcid>
        <ifx:mblnl>100</ifx:mblnl>
        <ifx:mbsup></ifx:mbsup>
     </ifx:grnbpmreq>
  </soap:Body>
</soap:Envelope>`
}

module.exports = {
  xmlGetNewById,
  xmlGetNews,
  xmlGetNewsByProduct,
  xmlGetRubrics,
  xmlLogin,
  xmlProducts
}