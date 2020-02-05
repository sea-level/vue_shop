<template>
  <div>
      <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
        <!-- 添加角色按钮区域 -->
        <el-row>
            <el-col>
                <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
            </el-col>
        </el-row>
        <!-- 角色列表区域-->
        <el-table :data="rolesList" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand">
                <template slot-scope="scope">
                    <el-row :class="['bdbottom',i1 === 0?'bdtop':'','vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                        <!-- 渲染一级权限 -->
                        <el-col :span="5">
                            <el-tag closable
                                    @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                            <i class="el-icon-caret-right"></i>
                        </el-col>
                        <!-- 渲染二级和三级权限 -->
                        <el-col :span="19">
                            <!-- 通过for循环嵌套渲染二级权限 -->
                            <el-row :class="[i2 === 0?'':'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                <el-col :span="6">
                                    <el-tag type="success"
                                    closable
                                     @close="removeRightById(scope.row,item2.id)"
                                    >{{item2.authName}}</el-tag>
                                    <i class="el-icon-caret-right"></i>
                                </el-col>
                                <el-col :span="18">
                                    <el-tag type="warning" 
                                            v-for="(item3,i3) in item2.children" 
                                            :key="item3.id" 
                                            closable
                                            @close="removeRightById(scope.row,item3.id)">
                                        {{item3.authName}}
                                    </el-tag>
                                </el-col>
                            </el-row>
                        </el-col>
                    </el-row>
                    <!-- <pre>
                        {{scope.row}}
                    </pre> -->
                </template>
            </el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column label="角色名称" prop="roleName"></el-table-column>
            <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
            <el-table-column label="操作" width="300px">
                <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-edit"
                                @click="showEidtDialog(scope.row.id)">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete"
                                @click="removeRoleById(scope.row.id)">删除</el-button>
                    <el-button size="mini" type="warning" 
                                icon="el-icon-setting"
                                @click="showSetRightDialog(scope.row)">分配权限</el-button>
                </template>
            </el-table-column>


        </el-table>
    </el-card>

    <!-- 添加角色的对话框 -->
    <el-dialog
  title="提示"
  :visible.sync="addDialogVisible"
  width="50%"
  @close="addDialogClosed">
 <el-form ref="addFormRef" :model="addForm" label-width="80px" :rules="addFormRules"> 
  <el-form-item label="角色名称" prop="roleName">
    <el-input v-model="addForm.roleName"></el-input>
  </el-form-item>
  <el-form-item label="角色描述" prop="roleDesc">
    <el-input v-model="addForm.roleDesc"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="addDialogVisible = false">取 消</el-button>
    <el-button type="primary"  @click="addRole">确 定</el-button>
  </span>
</el-dialog>
<!-- 修改角色的对话框 -->
<el-dialog
  title="提示"
  :visible.sync="editDialogVisible"
  width="50%"
  @close="editDialogClosed">
 <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="editFormRules"> 
  <el-form-item label="角色名称" prop="roleName">
    <el-input v-model="editForm.roleName"></el-input>
  </el-form-item>
  <el-form-item label="角色描述" prop="roleDesc">
    <el-input v-model="editForm.roleDesc"></el-input>
  </el-form-item>
  </el-form>
  <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false">取 消</el-button>
    <el-button type="primary"  @click="editRoleInfo">确 定</el-button>
  </span>
</el-dialog>
<!-- 分配权限的对话框 -->
<el-dialog
  title="分配权限"
  :visible.sync="setRightDialogVisible"
  width="50%"
  @close="setRightDialogClosed">
  <!-- 树形控件 -->
 <el-tree :data="rightsList" 
            :props="treeProps"
            show-checkbox
            node-key="id"
            default-expand-all
            :default-checked-keys="defKeys"
            ref="treeRef"></el-tree>
  <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false">取 消</el-button>
    <el-button type="primary"  
                @click="allotRights">确 定</el-button>
  </span>
</el-dialog>
  </div>
</template>

<script>
export default {
data(){
    return {
        // 所有角色列表区域
        rolesList:[],
        // 添加角色对话框的显示和隐藏
        addDialogVisible:false,
        // 添加角色的表单数据
        addForm:{
            roleName:"",
            roleDesc:""
        },
        // 添加角色的表单验证对象
        addFormRules:{
            roleName:[
                {required:true,message:"请输入角色名",trigger:"blur"}
            ]
        },
        // 修改角色对话框的显示和隐藏
        editDialogVisible:false,
        // 查询到的角色信息对象
        editForm:{},
        editFormRules:{
            roleName:[
                {required:true,message:"请输入修改后的角色名",trigger:"blur"}
            ]
        },
        // 控制分配权限对话框的显示与隐藏
        setRightDialogVisible:false,
        // 所有权限的数据
        rightsList:[],
        // 树形控件的属性绑定对象
        treeProps:{
            label:'authName',//看到的文本是哪个数据字段
            children:'children'//实现父子嵌套用哪一个属性
        },
        // 默认选中的节点的数组
        defKeys:[],
        // 当前即将分配权限的角色id
        roleId:''
    }
},
created(){
    this.getRolesList()
},
methods:{
     getRolesList(){
        this.$http.get('roles').then(res => {
             if(res.data.meta.status !== 200){
           return this.$message.error('获取列表角色失败')

       }
       this.rolesList = res.data.data
        })
      
    },
    // 监听添加角色对话框的关闭事件
    addDialogClosed(){
        this.$refs.addFormRef.resetFields()
    },
    addRole(){
        this.$refs.addFormRef.validate( valid => {
            if(!valid) return
            this.$http.post('roles',this.addForm).then(res => {
                if(res.data.meta.status !== 200){
                    this.$message.error('添加角色失败!')
                }
                this.$message.success('添加角色成功!')
                this.addDialogVisible = false
                this.getRolesList()
            })
        })
    },
    // 展示编辑角色的对话框
    showEidtDialog(id){
        this.$http.get('roles/'+ id).then(res => {
            if(res.data.meta.status !== 200){
                return this.$message.error('查询数据失败')
            }
            this.editForm = res.data.data
        })
        this.editDialogVisible = true
    },
    // 监听修改角色对话框的关闭事件
    editDialogClosed(){
        this.$refs.editFormRef.resetFields()
    },
    // 修改角色信息并提交
    editRoleInfo(){
        this.$refs.editFormRef.validate(valid => {
            if(!valid) return
            this.$http.put('roles/'+this.editForm.roleId,{
                roleName:this.editForm.roleName,
                roleDesc:this.editForm.roleDesc
            }).then(res => {
                if(res.data.meta.status !== 200){
                    return this.$message.error('更新角色信息失败!')
                }
                this.editDialogVisible = false
                this.getRolesList()
                this.$message.success('更新角色信息成功!')
            })
        })
    },
    // 根据id删除对应角色信息
    removeRoleById(id){
        // 弹窗询问用户是否删除数据
         this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$http.delete('roles/'+id).then(res => {
              if(res.data.meta.status !== 200){
                  return this.$message.error('删除用户失败!')
              }
              this.$message.success('删除用户成功!')
              this.getRolesList()
          })
        }).catch(() => {
          return this.$message.info('已取消删除')     
        });
    },
    // 根据id删除对应的权限
    async removeRightById(role,rightId){
        // 弹窗提示用户是否要删除
        const confirmResult = await
        this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        if(confirmResult !== 'confirm'){
            return this.$message.info('取消了删除!')
        }
        this.$http.delete(`roles/${role.id}/rights/${rightId}`).then(res => {
            console.log(res)
            if(res.data.meta.status !== 200){
                return this.$message.error('删除权限失败!')
            }
            // 防止打开的列表关上(整个列表的刷新) 直接重新刷新角色的权限
            role.children = res.data.data
        })
    },
    // 展示分配权限的对话框
    showSetRightDialog(role){
        this.roleId = role.id
        // 获取所有权限数据
        this.$http.get('rights/tree').then(res => {
            console.log(res)
            if(res.data.meta.status !== 200){
                return this.$message.error('获取权限失败!')
            }
            this.rightsList = res.data.data
        })
        // 递归获取三级节点id
        this.getLeafKeys(role,this.defKeys)
        this.setRightDialogVisible = true
    },
    // 通过递归获取角色下所有三级权限 并保存到defKeys数组
    getLeafKeys(node,arr){
        // 如果当前节点不包含children属性 则是三级节点
        if(!node.children){
            return arr.push(node.id)
        }
        // 循环当前node中的所有数组
        node.children.forEach(item => {
            this.getLeafKeys(item,arr)
        })

    },
    // 监听分配权限对话框关闭事件
    setRightDialogClosed(){
        // 不清空的话权限会越来越多
        this.defKeys = []
    },
    // 点击确定为角色分配权限
    allotRights(){
        const keys = [
            // ...展开运算符
            ...this.$refs.treeRef.
            getCheckedKeys(),
            ...this.$refs.treeRef.
            getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        this.$http.post(`roles/${this.roleId}/rights`,{
            rids:idStr
        }).then(res => {
            console.log(res)
            if(res.data.meta.status !== 200){
                return this.$message.error('分配权限失败!')
            }
            this.$message.success('分配权限成功')
            // 刷新列表
            this.getRolesList()
            // 关闭对话框
            this.setRightDialogVisible = false
        })
    }

}
}
</script>

<style lang="less" scoped>
.el-tag{
    margin:7px;
}
.bdtop{
    border-top:1px solid #eee;
}
.bdbottom{
    border-bottom: 1px solid #eee
}
.vcenter{
    display:flex;
    align-items: center;
}
</style>