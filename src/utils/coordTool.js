import vtkCoordinate from '@kitware/vtk.js/Rendering/Core/Coordinate'
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
// import vtkSphereSource from '@kitware/vtk.js/Filters/Sources/SphereSource';
import vtkCellPicker from '@kitware/vtk.js/Rendering/Core/CellPicker';
import vtkPointPicker from '@kitware/vtk.js/Rendering/Core/PointPicker'
// 世界坐标转屏幕坐标
export function getSceneCoordinate(position, scene) {
  let pCoorPress = vtkCoordinate.newInstance()
  pCoorPress.setCoordinateSystemToWorld();
  pCoorPress.setValue(position);
  let worldCoord = pCoorPress.getComputedDisplayValue(scene.renderer)
  return worldCoord
}

export function getSceneToWord(position, scene) {
  let pCoorPress = vtkCoordinate.newInstance()
  pCoorPress.setCoordinateSystemToDisplay();
  pCoorPress.setValue(position);
  let worldCoord = pCoorPress.getComputedWorldValue(scene.renderer)
  return worldCoord
}
export function cellPicker(scene, position, actors) {
  let actor = vtkActor.newInstance();
  let mapper = vtkMapper.newInstance();
  let picker = vtkCellPicker.newInstance();
  actor.setMapper(mapper);
  picker.setPickFromList(true);
  picker.setTolerance(0.1);
  picker.initializePickList()
  if(actors.length > 0) {
    picker.setPickList(actors.slice(0,8));
  }
 
  console.log(picker.getPickList(),111)
  picker.addPickList(actor);

  picker.pick([position.x, position.y, position.z], scene.renderer);

  let position1 = picker.getPickPosition()
  return position1
}

export function getActors(position, scene, actors) {
  let picker = vtkPointPicker.newInstance();
  picker.setTolerance(0.01);// 拾取的精度
  picker.initializePickList();
  picker.addPickList(actors);
  picker.pick([position.x, position.y, position.z], scene.renderer);
  return picker.getActors()
}