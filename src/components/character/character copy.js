import { useState, useEffect, useRef, useContext } from "react";

export default function Character({ show }) {
  return (
    <div className="small">
          <h3>人物表</h3> 
          <div className="row">
            <div className="col-4">
              <label for="inputName" className="font-weight-bold">姓名</label> 
              <input type="text" id="inputName" className="input-sm border-bottom" style={{width: "60%", }} />
            </div> 
            <div className="col-3">
              <label for="inputAge" className="font-weight-bold">年龄</label> 
              <input type="number" id="inputAge" className="input-sm border-bottom" style={{width: "50%", }} />
            </div> 
            <div className="col-5">
              <label for="occupation" className="font-weight-bold">职业</label> 
              <input type="text" id="occupation" readonly="readonly" className="input-sm border-bottom" style={{width: "70%", }} />
            </div>
          </div> 
          <div>
            <table className="table-bordered d-inline text-center d-inline table table-sm text-center table-bordered" style={{"line-height": 1}}>
              <tbody><tr>
                <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "3.5rem", height: "3rem", "line-height": 1.2}}>
                  <div>力量<small>.<br />STR</small></div>
                </td> 
                <td rowspan="2" className="align-middle" style={{width: "2rem"}}>
                  <div style={{"font-size": "1rem"}}></div>
                </td> 
                <td className="align-middle" style={{width: "1.6rem"}}>
                </td>
              </tr><tr>
                <td className="align-middle" style={{width: "1.6rem"}}>
                </td>
              </tr></tbody>
            </table>
            <table className="table-bordered d-inline text-center d-inline table table-sm text-center table-bordered border-primary" style={{"line-height": 1}}>
              <tbody><tr>
                <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "3.5rem", height: "3rem", "line-height": 1.2}}>
                  <div>敏捷<small>.<br />DEX</small></div>
                </td> 
                <td rowspan="2" className="table-bordered align-middle" style={{width: "2rem"}}>
                  <div style={{"font-size": "1rem"}}></div>
                </td> 
                <td className="table-bordered align-middle" style={{width: "1.6rem"}}>
                    
                </td>
              </tr><tr>
                <td className="table-bordered align-middle" style={{width: "1.6rem"}}>
                    
                </td>
              </tr></tbody>
            </table>
            <table className="table-bordered d-inline text-center d-inline table table-sm text-center table-bordered" style={{"line-height": 1}}>
              <tbody><tr>
                <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "3.5rem", height: "3rem", "line-height": 1.2}}>
                  <div style={{"line-height": 0.8}}>智力<small>.<br />INT<br />灵感idea</small></div>
                </td> 
                <td rowspan="2" className="table-bordered align-middle" style={{width: "2rem"}}><div style={{"font-size": "1rem"}}></div></td> <td className="table-bordered align-middle" style={{width: "1.6rem"}}>
                    
                </td></tr><tr><td className="table-bordered align-middle" style={{width: "1.6rem"}}>
                    
                </td>
              </tr></tbody>
            </table>
            <table className="table-bordered d-inline text-center d-inline table table-sm text-center" style={{"line-height": 1}}><tbody><tr><td rowspan="2" className="font-weight-bold align-middle" style={{ width: "3.5rem", height: "3rem", "line-height": 1.2}}><div>体质<small>.<br />CON</small></div></td> <td rowspan="2" className="table-bordered align-middle" style={{width: "2rem"}}><div style={{"font-size": "1rem"}}></div></td> <td className="table-bordered align-middle" style={{width: "1.6rem"}}>
                    
                </td></tr><tr><td className="table-bordered align-middle" style={{width: "1.6rem"}}>
                    
                </td></tr></tbody>
            </table>
            <table className="table-bordered d-inline text-center d-inline table table-sm text-center" style={{"line-height": 1}}><tbody><tr><td rowspan="2" className="font-weight-bold align-middle" style={{ width: "3.5rem", height: "3rem", "line-height": 1.2}}><div>外表<small>.<br />APP</small></div></td> <td rowspan="2" className="table-bordered align-middle" style={{width: "2rem"}}><div style={{"font-size": "1rem"}}></div></td> <td className="table-bordered align-middle" style={{width: "1.6rem"}}>
                    
                </td></tr><tr><td className="table-bordered align-middle" style={{width: "1.6rem"}}>
                    
                </td></tr></tbody>
            </table>
            <table className="table-bordered d-inline text-center d-inline table table-sm text-center" style={{"line-height": 1}}><tbody><tr><td rowspan="2" className="font-weight-bold align-middle" style={{ width: "3.5rem", height: "3rem", "line-height": 1.2}}><div>意志<small>.<br />POW</small></div></td> <td rowspan="2" className="table-bordered align-middle" style={{width: "2rem"}}><div style={{"font-size": "1rem"}}></div></td> <td className="table-bordered align-middle" style={{width: "1.6rem"}}>
                    
                </td></tr><tr><td className="table-bordered align-middle" style={{width: "1.6rem"}}>
                    
                </td></tr></tbody>
            </table>
            <table className="table-bordered d-inline text-center d-inline table table-sm text-center" style={{"line-height": 1}}><tbody><tr><td rowspan="2" className="font-weight-bold align-middle" style={{ width: "3.5rem", height: "3rem", "line-height": 1.2}}><div>体型<small>.<br />SIZ</small></div></td> <td rowspan="2" className="table-bordered align-middle" style={{width: "2rem"}}><div style={{"font-size": "1rem"}}></div></td> <td className="table-bordered align-middle" style={{width: "1.6rem"}}>
                    
                </td></tr><tr><td className="table-bordered align-middle" style={{width: "1.6rem"}}>
                    
                </td></tr></tbody>
            </table>
            <table className="table-bordered d-inline text-center d-inline table table-sm text-center" style={{"line-height": 1}}><tbody><tr><td rowspan="2" className="font-weight-bold align-middle" style={{ width: "3.5rem", height: "3rem", "line-height": 1.2}}><div>教育<small>.<br />EDU</small></div></td> <td rowspan="2" className="table-bordered align-middle" style={{width: "2rem"}}><div style={{"font-size": "1rem"}}></div></td> <td className="table-bordered align-middle" style={{width: "1.6rem"}}>
                    
                </td></tr><tr><td className="table-bordered align-middle" style={{width: "1.6rem"}}>
                    
                </td></tr></tbody></table></div> <br /> <table className="table-bordered d-inline text-center"><tbody><tr><td className="font-weight-bold align-middle" style={{width: "5rem", "line-height": 1.2}}><div>耐久<small>.<br />Hit Point</small></div></td> <td className="table-bordered align-middle" style={{width: "3.5rem"}}>
                    /
                </td> <td className="font-weight-bold align-middle" style={{width: "5rem", "line-height": 1.2}}><div>理智<small>.<br />Sanity</small></div></td> <td className="table-bordered align-middle" style={{width: "3.5rem"}}>
                    /
                </td></tr></tbody> <br /> <tbody><tr><td className="font-weight-bold align-middle" style={{width: "5rem", "line-height": 1.2}}><div>幸运<small>.<br />Luck</small></div></td> <td className="table-bordered align-middle" style={{width: "3.5rem"}}>
                    
                </td> <td className="font-weight-bold align-middle" style={{width: "5rem", "line-height": 1.2}}><div>魔法<small>.<br />Magic Point</small></div></td> <td className="table-bordered align-middle" style={{width: "3.5rem"}}>
                    /</td></tr></tbody>
            </table> <br /> <br /> 
            <h6><strong>技能</strong></h6> 
            <div>
              <div className="row small">
                <div className="col-4" style={{padding: "0px"}}>
                  <div>
                    <table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}>
                      <tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>估价<small>.<br />Appraise</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>5</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    2
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    1
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>考古学<small>.<br />Archaeology</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>1</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr></tbody></table></div><div><div>艺术/手艺<small>Art/Craft</small></div></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>摄影<small>.<br />Photography</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>5</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    2
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    1
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}><input type="text" className="border-bottom" style={{width: "80%", }} /></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>5</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    2
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    1
                </td></tr></tbody></table></div><div><div style={{"line-height": 0.5}}><br /></div></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>魅惑<small>.<br />Charm</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>15</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    7
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    3
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>攀爬<small>.<br />Climb</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>20</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    10
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    4
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="invisible" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>信用评级<small>.<br />Credit Rating</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div></div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="invisible" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>克苏鲁神话<small>.<br />Cthulhu Mythos</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>0</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>乔装<small>.<br />Disguise</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>5</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    2
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    1
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>闪避<small>.<br />Dodge</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div></div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>汽车驾驶<small>.<br />Drive Auto</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>20</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    10
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    4
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>话术<small>.<br />Fast Talk</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>5</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    2
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    1
                </td></tr></tbody></table></div></div><div className="col-4" style={{padding: "0px"}}><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>格斗：斗殴<small>.<br />Fighting:Brawl</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>25</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    12
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    5
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>急救<small>.<br />First Aid</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>30</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    15
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    6
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>历史<small>.<br />History</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>5</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    2
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    1
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>恐吓<small>.<br />Intimidate</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>15</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    7
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    3
                </td></tr></tbody></table></div><div><div>外语<small>Language</small></div></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>拉丁语<small>.<br />Latin</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>1</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}><input type="text" className="border-bottom" style={{width: "80%", }} /></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>1</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr></tbody></table></div><div><div style={{"line-height": 0.5}}><br /></div></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>母语<small>.<br />Own Language</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div></div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>法律<small>.<br />Law</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>5</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    2
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    1
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>图书馆使用<small>.<br />Library Use</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>20</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    10
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    4
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>聆听<small>.<br />Listen</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>20</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    10
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    4
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>锁匠<small>.<br />Locksmith</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>1</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>医学<small>.<br />Medicine</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>1</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr></tbody></table></div></div><div className="col-4" style={{padding: "0px"}}><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>博物学<small>.<br />Nature World</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>10</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    5
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    2
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>说服<small>.<br />Persuade</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>10</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    5
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    2
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>心理学<small>.<br />Psychology</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>10</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    5
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    2
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>骑术<small>.<br />Ride</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>5</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    2
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    1
                </td></tr></tbody></table></div><div><div>科学<small>Science</small></div></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>生物学<small>.<br />Biology</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>1</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>药学<small>.<br />Pharmacy</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>1</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}><input type="text" className="border-bottom" style={{width: "80%", }} /></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>1</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    0
                </td></tr></tbody></table></div><div><div style={{"line-height": 0.5}}><br /></div></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>侦查<small>.<br />Spot Hidden</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>25</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    12
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    5
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>潜行<small>.<br />Stealth</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>20</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    10
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    4
                </td></tr></tbody></table></div><div><table className="table-bordered d-inline" style={{"line-height": 1, width: "100%"}}><tbody><tr><td rowspan="2" className="align-middle" style={{}}><input type="checkbox" disabled="disabled" className="" /></td> <td rowspan="2" className="font-weight-bold align-middle" style={{ width: "4rem", height: "2rem", "line-height": 1.2}}>追踪<small>.<br />Track</small></td> <td rowspan="2" className="table-bordered align-middle text-center" style={{width: "1.2rem"}}><div>10</div></td> <td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    5
                </td></tr><tr><td className="table-bordered align-middle text-center" style={{width: "1rem"}}>
                    2
                </td></tr></tbody></table></div></div></div> </div> <br /> <h6><strong>随身物品</strong></h6> <div className="row"></div></div>
  )
}