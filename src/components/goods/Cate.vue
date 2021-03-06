<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table     
        class="treeTable"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-circle-check"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit"
                    @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete"
                    @click="removeCatById(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3,5,10,15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" 
              :visible.sync="addCateDialogVisible" 
              width="50%"
              @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form
        ref="addCateFormRef"
        :model="addCateForm"
        :rules="addCateFormRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options指定数据源 -->
          <!-- props指定配置对象 -->
          <!-- clearable 可清空选择内容 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
          
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类对话框 -->
    <!-- 添加分类的对话框 -->
    <el-dialog title="提示" 
              :visible.sync="editCateDialogVisible" 
              width="50%"
              @close="editCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form
        ref="editCateFormRef"
        :model="editCateForm"
        :rules="editCateFormRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
        
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCateInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        // 获取几级数据
        type: 3,
        pagenum: 1, //页数
        pagesize: 5 //每页显示几个
      },
      // 商品分类的数据列表 默认为空
      cateList: [],
      // 总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "isok"
        },
        {
          label: "排序",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "order"
        },
        {
          label: "操作",
          // 表示将当前列定义为模板列
          type: "template",
          // 表示当前这一列使用模板名称
          template: "opt"
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加的分类名称
        cat_name: "",
        // 父级分类的id
        cat_pid: 0,
        // 分类的等级 默认一级
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请输入分类名称", trigger: "blur" }
        ]
      },
      //   父级分类的列表
      parentCateList: [],
      cascaderProps: {
        expandTrigger:'hover', //次级菜单的展开方式
        value: "cat_id", //指定选项的值为选项对象的某个属性值(选中的值)
        label: "cat_name", //指定选项标签为选项对象的某个属性值(显示的值)
        children: "children", //父级选择子级的属性
        checkStrictly:"true",//默认true:只可以选择三级菜单 false:可以选择二级或三级菜单
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 修改分类对话框的显示与隐藏
      editCateDialogVisible:false,
      // 查询到的分类信息对象
      editCateForm:{},
      editCateFormRules:{
        cat_name:[
          {required:true,message:'请输入修改后的分类名称',trigger:'blur'}
        ]
      }
    };
  },
  created() {
    this.getCateList();
  },
  methods: {
    getCateList() {
      this.$http.get("categories", { params: this.queryInfo }).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error("获取商品分类失败");
        }
        // 把数据列表赋值给catelist
        this.cateList = res.data.data.result;
        this.total = res.data.data.total;
      });
    },
    // 监听pagesize改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    // 点击显示添加分类对话框
    showAddCateDialog() {
      // 先获取父级分类的数据列表
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    // 获取父级的分类数据列表
    getParentCateList() {
      this.$http.get("categories", { params: { type: 2 } }).then(res => {
        if (res.data.meta.status !== 200) {
          return this.$message.error("获取父级分类数据是失败!");
        }
        console.log(res.data.data);
        this.parentCateList = res.data.data;
      });
    },
    // 选择发生变化触发这个函数
    parentCateChanged() {
      console.log(this.selectedKeys)
      // 如果selectedKeys数组的length>0 则选中了父级分类
      // 反之没有选中父级分类
      // 总选择selectedKeys数组中最后一个id作为父级分类id
      // [父级分类的id]
      if(this.selectedKeys.length>0){
        this.addCateForm.cat_pid=this.selectedKeys[this.selectedKeys.length-1]

        // 如果选择一级分类 则要添加的等级是1 选择二级分类 添加等级是2
      // 添加的分类和数组length一致
      // [为当前分类的等级赋值]
      this.addCateForm.cat_level = this.selectedKeys.length
      return
      }else{
        // 没选择要清零
        this.addCateForm.cat_pid=0

      this.addCateForm.cat_level = 0

      }
      
    },
    // 点击按钮添加新的分类
    addCate(){
      this.$refs.addCateFormRef.validate(async valid => {
        if(!valid) return 
       const {data:res} = await this.$http.post('categories',this.addCateForm)
       if(res.meta.status !== 201){
         return this.$message.error('添加分类失败!')

       }
       this.$message.success('添加分类成功!')
       this.getCateList()
       this.addCateDialogVisible = false
      })
    },
    // 监听对话框的关闭事件 重置表单数据
    addCateDialogClosed(){
      // 清空分类名称
      this.$refs.addCateFormRef.resetFields()
      // 清空已经选择的分类
      this.selectedKeys=[]
      this.addCateForm.cat_level=0
      this.addCateForm.cat_pid=0
    },
    // 显示编辑分类的对话框
    async showEditDialog(id){
      const {data:res} = await this.$http.get(`categories/`+ id)
      console.log(res)

      if(res.meta.status !== 200){
        return this.$message.error('查询分类数据失败!')
      }
      this.editCateForm = res.data
      this.editCateDialogVisible = true
    },
    // 监听修改对话框的关闭事件 重置表单数据
    editCateDialogClosed(){
      this.$refs.editCateFormRef.resetFields()
    },
    // 修改分类信息并提交
    editCateInfo(){
      this.$refs.editCateFormRef.validate(async valid => {
        if(!valid) return
        const{data:res} = await this.$http.put(`categories/${this.editCateForm.cat_id}`,{
          cat_name:this.editCateForm.cat_name
        })
        if(res.meta.status !== 200){
          return this.$message.error('修改分类信息失败!')
        }
        this.editCateDialogVisible = false
        this.getCateList()
        this.$message.success('修改分类信息成功!')
      })
    },
    // 根据id删除对应分类信息
    removeCatById(id){
      // 弹窗询问用户是否删除数据
      this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then( () => {
          this.$http.delete(`categories/${id}`).then( res => {
            if(res.data.meta.status !== 200){
              return this.$message.error('删除分类失败!')
            }
            this.$message.success('删除分类成功!')
            this.getCateList()
          })
        }).catch(() => {
          return this.$message.info('已取消删除')
        })
    }
  }
};
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
.el-cascader-panel {
  height: 300px;
}
</style>