import { getSceneCoordinate } from './coordTool'
import { Representation } from '@kitware/vtk.js/Rendering/Core/Property/Constants';
import vtkLineSource from '@kitware/vtk.js/Filters/Sources/LineSource';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
// 直线测量
class LineWidget {
  constructor(x, y, z, num, scene, id, parentDomId) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.num = num;
    this.point2_ = []
    this.scene = scene;
    this.id = id
    this.parentDomId = parentDomId
    this.isDisplay = this.isDisplayFun
    this.setColor = this.setColorFn
    this.remove = this.removeFn
    this.update = this.updateFn
    this.updateLine = this.updateLineFn
  }
  created() {
    let parentDom = document.querySelector(this.parentDomId)
    let windowSize = this.scene.apiSpecificRenderWindow.getSize()
    let location = getSceneCoordinate([this.x, this.y, this.z], this.scene)
    this.location = { x: location[0], y: windowSize[1] - location[1] }
    let g = this.createSvg('g', { id: 'g_line'+this.id })
    // <line x1="0" y1="10" x2="0" y2="100" style="stroke:#006600;"></line> 
    let x1 = location[0], y1 = windowSize[1] - location[1]
    let text = { name: 'line', 
      property: { style: 'stroke:#00ff00;', x1: x1, y1: y1, x2: x1, y2: y1 , id: 'line_'+this.id }
    }
    let textDom = this.createSvg(text.name, text.property)
    g.appendChild(textDom)
    parentDom.appendChild(g)
  } 
  createSvg(tag, obj) {
    const oTag = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const attr in obj) {
      if(attr == 'children') {
        obj[attr].forEach(val => {
          if(val.text.indexOf('\n')) {
            val.text.split('\n').forEach(ele => {
              let tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
              let text = document.createTextNode(ele);
              tspan.appendChild(text)
              tspan.setAttribute('dy', 13)
              tspan.setAttribute('x', this.location.x)
              oTag.appendChild(tspan)
            })
          }else {
            let text = document.createTextNode(val.text);
            oTag.appendChild(text)
          }
        })
        continue
      }
      oTag.setAttribute(attr, obj[attr]);
    }
    return oTag;
  }
  // 更新绘制线条
  updateLineFn(val) {
    this.point2_ = val
    this.point2 =  getSceneCoordinate(val, this.scene)
    let windowSize = this.scene.apiSpecificRenderWindow.getSize()
    let gDom = document.querySelector('#line_'+this.id)
    gDom.setAttribute('x2', this.point2[0])
    gDom.setAttribute('y2',windowSize[1] - this.point2[1])
  }
  // 显示隐藏
  // isDisplayFun(num) {
  //   let gDom = document.querySelector('#g_line'+this.id)
  //   if(!gDom) return
  //   gDom.style.display = num == this.num ? 'inline' : 'none'
  // }
  // 设置颜色
  setColorFn(color) {
    let gDom = document.querySelector('#line_'+this.id)
    gDom.setAttribute('style', `stroke:${ color }`)
  }
  removeFn() {
    document.getElementById('g_line'+this.id).remove()
  }
  // 放大缩小改变屏幕坐标位置
  updateFn() {
    let location = getSceneCoordinate([this.x, this.y, this.z], this.scene)
    let windowSize = this.scene.apiSpecificRenderWindow.getSize()
    if(!this.point2_.length) return
    let location2 = getSceneCoordinate(this.point2_, this.scene)
    let gDom = document.querySelector('#line_'+this.id)
    gDom.setAttribute('x1', location[0])
    gDom.setAttribute('y1', windowSize[1] - location[1])
    gDom.setAttribute('x2', location2[0])
    gDom.setAttribute('y2', windowSize[1] - location2[1])
  }
}
class labelWidget {
  constructor(x, y, z, scene, id, parentDomId) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.scene = scene;
    this.id = id
    this.parentDomId = parentDomId
    this.isDisplay = this.isDisplayFun
    this.setColor = this.setColorFn
    this.remove = this.removeFn
    this.update = this.updateFn
  }
  created(word) {
    let parentDom = document.querySelector(this.parentDomId)
    let windowSize = this.scene.apiSpecificRenderWindow.getSize()
    let location = getSceneCoordinate([this.x, this.y, this.z], this.scene)
    this.location = { x: location[0], y: windowSize[1] - location[1] }
    
    let g = this.createSvg('g', { id: 'g_'+this.id, class: 'text-container' })

    let rect = {
      name: 'rect',property:{  x: location[0]-15, y: windowSize[1] - location[1]-10, id: 'rect_'+this.id, fill: '#000000',
        width: 100, height: 40, rx: 5, ry: 5, opacity: 0.5
      }
    }
    g.appendChild(this.createSvg(rect.name, rect.property))

    let text = { name: 'text', property: { fill: '#00ff00', x: location[0], y: windowSize[1] - location[1], id: 'text_'+this.id,
        children: [{ text: word }]
      }
    }
    let textDom = this.createSvg(text.name, text.property)
    console.log(textDom)
    g.appendChild(textDom)
    
    parentDom.appendChild(g)
  } 
  createSvg(tag, obj) {
    const oTag = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const attr in obj) {
      if(attr == 'children') {
        obj[attr].forEach(val => {
          if(val.text.indexOf('\n')) {
            val.text.split('\n').forEach(ele => {
              let tspan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
              let text =document.createTextNode(ele);
              tspan.appendChild(text)
              tspan.setAttribute('dy', 13)
              tspan.setAttribute('x', this.location.x)
              tspan.setAttribute('style', 'font-size: 16px')
              oTag.appendChild(tspan)
            })
          }else {
            let text =document.createTextNode(val.text);
            oTag.appendChild(text)
          }
          
        })
        continue
      }
      oTag.setAttribute(attr, obj[attr]);
    }
    return oTag;
  }
  // // 显示隐藏
  // isDisplayFun(num) {
  //   let gDom = document.querySelector('#g_'+this.id)
  //   if(!gDom) return
  //   gDom.style.display = num == this.num ? 'inline' : 'none'
  // }
  // 设置颜色
  setColorFn(color) {
    let gDom = document.querySelector('#text_'+this.id)
    gDom.setAttribute('fill', color)
  }
  removeFn() {
    document.getElementById('g_'+this.id).remove()
  }
  // 放大缩小改变屏幕坐标位置
  updateFn() {
    let location = getSceneCoordinate([this.x, this.y, this.z], this.scene)
    let windowSize = this.scene.apiSpecificRenderWindow.getSize()
    let gDom = document.querySelector('#text_'+this.id).childNodes
    for(let i = 0; i< gDom.length; i++) {
      // let cdom = document.querySelector('#tspan_'+this.id+i)
      gDom[i].setAttribute('x', location[0])
      gDom[i].setAttribute('y', windowSize[1] - location[1])
      gDom[i].setAttribute('dy', 13*(i))
    }


    let rectangleDom = document.querySelector('#rect_'+this.id)
    
    rectangleDom.setAttribute('x', location[0]-15)
    rectangleDom.setAttribute('y',windowSize[1] - location[1]-25)
    rectangleDom.setAttribute('width',100)
    rectangleDom.setAttribute('height',40 )
  }
  // 获取文本节点内容
  getWord() {
    return document.querySelector('#text_'+this.id).textContent
  }
  // 文字修改
  editWord(word) {
    let tDom = document.querySelector('#text_'+this.id)
    tDom.textContent  = word
  }
}
// 两点之间距离
function distance2BetweenPoints(x, y) {
  return (x[0] - y[0]) * (x[0] - y[0]) + (x[1] - y[1]) * (x[1] - y[1]) + (x[2] - y[2]) * (x[2] - y[2]);
}
class RulerActor {
  constructor() {
    this.actor = vtkActor.newInstance();
    this.mapper = vtkMapper.newInstance();
    this.LineSource = vtkLineSource.newInstance();
  }
}
class Ruler {
  constructor(scene, id, spacingZ) {
    this.scene = scene;
    this.id = id
    this.spacingZ = spacingZ
  }
  create(points, num) {
    let container = new RulerActor();
    // 处理mip显示问题
    container.actor.get().id = this.id;
    container.actor.get().toolType = 'ruler';
    // container.actor.get().num = num;
    container.actor.getProperty().setColor(0, 1, 0);
    container.LineSource.setResolution(10)
    container.LineSource.getOutputData().get().points.setNumberOfPoints(10)
    container.LineSource.setPoint1(points[0][0], points[0][1], points[0][2]);
    container.LineSource.setPoint2(points[0][0] - 0.1, points[0][1], points[0][2]);
    for (var i = 0; i <= points.length - 1; i++) {
      container.LineSource.getOutputData().get().points.setPoint(i, points[i][0], points[i][1], points[i][2]);
    }
    container.LineSource.update();
    container.mapper.setInputConnection(container.LineSource.getOutputPort());

    container.actor.modified();
    container.actor.getProperty().setRepresentation(Representation.WIREFRAME);
    container.actor.getProperty().setLineWidth(2);
    container.actor.setMapper(container.mapper);
    this.scene.renderer.addActor(container.actor);
    this.scene.renderWindow.render();
  }
}

export default {
  LineWidget,
  labelWidget,
  Ruler,
  distance2BetweenPoints
}