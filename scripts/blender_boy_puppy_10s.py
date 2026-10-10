"""Headless Blender script: 10s stylized 3D animation (boy + puppy backyard)."""

import math
import os

import bpy
from mathutils import Vector, Euler

FPS = 24
DURATION = 10
FRAMES = FPS * DURATION
OUTPUT = os.environ.get(
    "BLENDER_ANIM_OUTPUT",
    "/workspace/output/boy_puppy_3d_10s.mp4",
)


def clear_scene() -> None:
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete(use_global=False)
    for block in (
        bpy.data.meshes,
        bpy.data.materials,
        bpy.data.lights,
        bpy.data.cameras,
        bpy.data.armatures,
    ):
        for item in block:
            block.remove(item)


def mat(name: str, color, roughness=0.45):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = (*color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    return m


def add_mesh(name, primitive, location, scale=(1, 1, 1), material=None):
    if primitive == "UV_SPHERE":
        bpy.ops.mesh.primitive_uv_sphere_add(location=location)
    elif primitive == "CAPSULE":
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.35, depth=1.0, location=location)
    elif primitive == "CUBE":
        bpy.ops.mesh.primitive_cube_add(location=location)
    elif primitive == "PLANE":
        bpy.ops.mesh.primitive_plane_add(size=2, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = scale
    if material:
        obj.data.materials.append(material)
    return obj


def setup_world() -> None:
    world = bpy.context.scene.world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.55, 0.78, 1.0, 1.0)
    bg.inputs[1].default_value = 1.0


def setup_camera() -> bpy.types.Object:
    cam_data = bpy.data.cameras.new("Camera")
    cam = bpy.data.objects.new("Camera", cam_data)
    bpy.context.collection.objects.link(cam)
    bpy.context.scene.camera = cam
    cam.location = (0, -8.5, 3.2)
    cam.rotation_euler = Euler((math.radians(72), 0, 0), "XYZ")
    cam.data.lens = 35
    return cam


def setup_light() -> None:
    sun_data = bpy.data.lights.new("Sun", type="SUN")
    sun = bpy.data.objects.new("Sun", sun_data)
    bpy.context.collection.objects.link(sun)
    sun.rotation_euler = Euler((math.radians(35), math.radians(25), 0), "XYZ")
    sun.data.energy = 3.0


def build_environment() -> None:
    grass_m = mat("Grass", (0.25, 0.62, 0.22))
    ground = add_mesh("Ground", "PLANE", (0, 0, 0), (12, 12, 1), grass_m)
    fence_m = mat("Fence", (0.55, 0.38, 0.22))
    for x in (-5.5, 5.5):
        add_mesh(f"Fence{x}", "CUBE", (x, 2, 0.6), (0.15, 4, 0.6), fence_m)
    house_m = mat("House", (0.95, 0.78, 0.2))
    add_mesh("House", "CUBE", (0, 6, 1.2), (2.5, 1.5, 1.2), house_m)


def build_boy() -> dict:
    skin = mat("Skin", (0.92, 0.72, 0.58))
    shirt = mat("Shirt", (0.95, 0.95, 0.98))
    shorts = mat("Shorts", (0.15, 0.35, 0.85))
    hair = mat("Hair", (0.18, 0.1, 0.06))

    root = bpy.data.objects.new("BoyRoot", None)
    bpy.context.collection.objects.link(root)
    root.location = (-1.2, 0, 0)

    torso = add_mesh("Torso", "CAPSULE", (0, 0, 1.0), (0.45, 0.35, 0.55), shirt)
    head = add_mesh("Head", "UV_SPHERE", (0, 0, 1.65), (0.32, 0.32, 0.32), skin)
    hair_obj = add_mesh("Hair", "UV_SPHERE", (0, 0, 1.78), (0.34, 0.34, 0.22), hair)
    leg_l = add_mesh("LegL", "CAPSULE", (-0.18, 0, 0.45), (0.16, 0.16, 0.45), shorts)
    leg_r = add_mesh("LegR", "CAPSULE", (0.18, 0, 0.45), (0.16, 0.16, 0.45), shorts)
    arm_l = add_mesh("ArmL", "CAPSULE", (-0.55, 0, 1.05), (0.12, 0.12, 0.35), skin)
    arm_r = add_mesh("ArmR", "CAPSULE", (0.55, 0, 1.05), (0.12, 0.12, 0.35), skin)

    for part in (torso, head, hair_obj, leg_l, leg_r, arm_l, arm_r):
        part.parent = root

    return {
        "root": root,
        "arm_r": arm_r,
        "arm_l": arm_l,
        "leg_l": leg_l,
        "leg_r": leg_r,
    }


def build_puppy() -> dict:
    white = mat("PupWhite", (0.95, 0.95, 0.95))
    patch = mat("PupPatch", (0.55, 0.28, 0.12))
    collar = mat("Collar", (0.85, 0.1, 0.1))

    root = bpy.data.objects.new("PupRoot", None)
    bpy.context.collection.objects.link(root)
    root.location = (0.3, 0.2, 0)

    body = add_mesh("PupBody", "UV_SPHERE", (0, 0, 0.35), (0.45, 0.3, 0.28), white)
    head = add_mesh("PupHead", "UV_SPHERE", (0.35, 0, 0.45), (0.28, 0.25, 0.25), patch)
    ear_l = add_mesh("EarL", "CUBE", (0.28, -0.12, 0.62), (0.08, 0.04, 0.12), patch)
    ear_r = add_mesh("EarR", "CUBE", (0.28, 0.12, 0.62), (0.08, 0.04, 0.12), patch)
    tail = add_mesh("Tail", "CAPSULE", (-0.35, 0, 0.45), (0.06, 0.06, 0.18), white)
    leg_fl = add_mesh("LegFL", "CAPSULE", (0.15, -0.18, 0.08), (0.07, 0.07, 0.14), white)
    leg_fr = add_mesh("LegFR", "CAPSULE", (0.15, 0.18, 0.08), (0.07, 0.07, 0.14), white)
    leg_bl = add_mesh("LegBL", "CAPSULE", (-0.15, -0.18, 0.08), (0.07, 0.07, 0.14), white)
    leg_br = add_mesh("LegBR", "CAPSULE", (-0.15, 0.18, 0.08), (0.07, 0.07, 0.14), white)
    add_mesh("Collar", "CAPSULE", (0.22, 0, 0.35), (0.12, 0.12, 0.03), collar)

    for part in (body, head, ear_l, ear_r, tail, leg_fl, leg_fr, leg_bl, leg_br):
        part.parent = root

    return {"root": root, "legs": [leg_fl, leg_fr, leg_bl, leg_br], "tail": tail}


def build_ball() -> bpy.types.Object:
    ball_m = mat("Ball", (0.9, 0.1, 0.1), roughness=0.3)
    ball = add_mesh("Ball", "UV_SPHERE", (-0.8, 0.1, 0.9), (0.12, 0.12, 0.12), ball_m)
    return ball


def build_butterfly() -> bpy.types.Object:
    wing = mat("Wing", (0.95, 0.45, 0.05))
    body = add_mesh("Butterfly", "CAPSULE", (2.0, 1.0, 1.2), (0.03, 0.03, 0.12), wing)
    return body


def set_key(obj, frame, loc=None, rot=None):
    if loc is not None:
        obj.location = Vector(loc)
        obj.keyframe_insert(data_path="location", frame=frame)
    if rot is not None:
        obj.rotation_euler = Euler(rot, "XYZ")
        obj.keyframe_insert(data_path="rotation_euler", frame=frame)


def animate(boy, pup, ball, butterfly, cam) -> None:
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = FRAMES

    boy_root = boy["root"]
    pup_root = pup["root"]

    # 0-2s: throw
    for f, loc in [(1, (-1.2, 0, 0)), (24, (-1.0, 0.1, 0)), (48, (-1.1, 0, 0))]:
        set_key(boy_root, f, loc=loc)
    set_key(boy["arm_r"], 1, rot=(0, 0, -0.4))
    set_key(boy["arm_r"], 18, rot=(0.8, 0, 1.2))
    set_key(boy["arm_r"], 36, rot=(0.2, 0, 0.3))

    set_key(ball, 1, loc=(-0.8, 0.1, 0.9))
    set_key(ball, 24, loc=(0.5, 0.8, 1.4))
    set_key(ball, 48, loc=(2.2, 1.8, 0.25))

    # puppy chase 1-4s
    chase = [
        (1, (0.3, 0.2, 0.12)),
        (24, (0.8, 0.5, 0.12)),
        (48, (1.5, 1.0, 0.12)),
        (72, (2.0, 1.5, 0.12)),
        (96, (2.1, 1.7, 0.12)),
    ]
    for f, loc in chase:
        set_key(pup_root, f, loc=loc)
        set_key(pup_root, f, rot=(0, 0, math.radians(8 if f % 2 == 0 else -8)))

    # leg cycle during chase
    for i, leg in enumerate(pup["legs"]):
        for f in range(24, 97, 6):
            phase = (f // 6 + i) % 2
            set_key(leg, f, loc=leg.location, rot=(0.5 if phase else -0.5, 0, 0))

    # 4-6s butterfly jump
    set_key(pup_root, 120, loc=(2.0, 1.2, 0.12))
    set_key(butterfly, 96, loc=(2.0, 1.0, 1.0))
    set_key(butterfly, 120, loc=(2.3, 1.2, 1.4))
    set_key(butterfly, 144, loc=(2.5, 1.0, 1.6))
    set_key(pup_root, 132, loc=(2.1, 1.1, 0.12))
    set_key(pup_root, 138, loc=(2.1, 1.1, 0.65))
    set_key(pup_root, 144, loc=(2.1, 1.1, 0.12))

    # 6-8s roll in leaves (pup on back)
    for f, z, rot_z in [(144, 0.12, 0), (168, 0.18, 1.2), (192, 0.14, 2.4)]:
        set_key(pup_root, f, loc=(1.0, -0.5, z), rot=(rot_z, 0, 0))

    set_key(boy_root, 168, loc=(0.2, -0.8, 0))
    set_key(boy["arm_l"], 168, rot=(0.9, 0, -0.4))
    set_key(boy["arm_r"], 168, rot=(0.9, 0, 0.4))

    # 8-10s hug + thumbs up pose
    set_key(boy_root, 216, loc=(0.5, -0.3, 0))
    set_key(pup_root, 216, loc=(0.9, -0.2, 0.12))
    set_key(boy["arm_r"], 216, rot=(0.4, 0, 0.9))
    set_key(boy["arm_l"], 216, rot=(0.4, 0, -0.5))
    set_key(boy_root, 240, loc=(0.4, -0.2, 0))

    # camera subtle move
    set_key(cam, 1, loc=(0, -8.5, 3.2))
    set_key(cam, 120, loc=(0.4, -7.8, 3.0))
    set_key(cam, 240, loc=(0.2, -7.2, 2.8))


def setup_render() -> None:
    scene = bpy.context.scene
    scene.render.image_settings.file_format = "FFMPEG"
    scene.render.ffmpeg.format = "MPEG4"
    scene.render.ffmpeg.codec = "H264"
    scene.render.ffmpeg.constant_rate_factor = "HIGH"
    scene.render.ffmpeg.ffmpeg_preset = "GOOD"
    scene.render.fps = FPS
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.filepath = OUTPUT
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "MATERIAL"
    scene.display.shading.show_shadows = True


def main() -> None:
    clear_scene()
    setup_world()
    setup_light()
    cam = setup_camera()
    build_environment()
    boy = build_boy()
    pup = build_puppy()
    ball = build_ball()
    butterfly = build_butterfly()
    animate(boy, pup, ball, butterfly, cam)
    setup_render()
    bpy.ops.render.render(animation=True)
    print(f"Rendered animation to {OUTPUT}")


if __name__ == "__main__":
    main()
