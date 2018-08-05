<template>
  <el-card class="box-card">
    <!-- 面包屑 -->
    <my-breadcrumb level1="权限管理" level2="角色列表"></my-breadcrumb>
    <el-row class="row-add">
      <el-col :span="24">
        <el-button>添加</el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table
      v-loading="loading"
      class="tb"
      border
      stripe
      :data="list"
      style="width: 100%">
      <!-- 展示列 -->
      <el-table-column type="expand">
        <template slot-scope="scope">
          <!-- 一级权限 item1 -->
          <el-row
            v-for="item1 in scope.row.children"
            :key="item1.id">
            <el-col :span="4">
              <!-- 展示一级权限 -->
              <el-tag @close="hanldeClose(scope.row, item1.id)" class="level1" closable>{{item1.authName}}</el-tag>
              <i class="el-icon-arrow-right"></i>
            </el-col>
            <!-- 二级、三级权限 -->
            <el-col :span="20">
              <!-- 二级权限 -->
              <el-row
                v-for="item2 in item1.children"
                :key="item2.id">
                <el-col :span="4">
                  <!-- 显示二级权限 -->
                  <el-tag @close="hanldeClose(scope.row, item2.id)" closable type="success">{{item2.authName}}</el-tag>
                  <i class="el-icon-arrow-right"></i>
                </el-col>
                <el-col :span="20">
                  <!-- 三级权限 -->
                  <el-tag
                    @close="hanldeClose(scope.row, item3.id)"
                    class="level3"
                    closable
                    v-for="item3 in item2.children"
                    :key="item3.id"
                    type="warning">
                    {{item3.authName}}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
          <!-- 未分配权限 -->
          <el-row v-if="scope.row.children.length === 0">
            <el-col :span="24">未分配权限</el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column
        type="index"
        width="50">
      </el-table-column>
      <el-table-column
        prop="roleName"
        label="角色名称"
        width="180">
      </el-table-column>
      <el-table-column
        prop="roleDesc"
        label="角色描述"
        width="180">
      </el-table-column>
      <el-table-column
      label="操作">
        <template slot-scope="scope">
          <el-button plain size="mini" type="primary" icon="el-icon-edit" ></el-button>
          <el-button plain size="mini" type="danger" icon="el-icon-delete" ></el-button>
          <el-button @click="handleShowRightsDialog(scope.row)" plain size="mini" type="success" icon="el-icon-check" ></el-button>
        </template>
      </el-table-column>
      </el-table>

      <!-- 分配角色的对话框 -->
      <el-dialog
        @open="handleOpenDialog"
        title="权限分配"
        :visible.sync="dialogVisible">

        <!-- 树形结构
            data: 提供树形数据
            props: 设置数据中显示的属性

            node-key  给每一个节点一个标识，一般绑定id
            当要使用default-expanded-keys和default-checked-keys必须先设置node-key
            default-checked-keys设置默认选中的节点
        -->
        <el-tree
          :data="treeData"
          :props="defaultProps"
          node-key="id"
          default-checked-keys="checkedList"
          show-checkbox
          default-expand-all>
        </el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
</template>

<script>
export default {
  data() {
    return {
      list: [],
      loading: true,
      // 控制对话框显示隐藏
      dialogVisible: false,
      // 绑定tree所用的数据
      treeData: [],
      // 配置要展现数据中的哪个属性
      defaultProps: {
        children: 'children',
        label: 'authName'
      },
      // 获取要选择的节点的id
      checkedList: []
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    // 加载角色列表
    async loadData() {
      this.loading = true;
      const {data: resData} = await this.$http.get('roles');
      this.loading = false;
      const {data, meta: {status, msg}} = resData;
      if (status === 200) {
        this.list = data;
      } else {
        this.$message.error(msg);
      }
    },
    // 标签的关闭事件
    async hanldeClose(role, rightId) {
      const {data: resData} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`);
      const {data, meta: {status, msg}} = resData;
      if (status === 200) {
        this.$message.success(msg);
        // 重新绑定当前角色的children权限
        role.children = data;
      } else {
        this.$message.error(msg);
      }
    },
    // 打开对话框的时候执行
    async handleOpenDialog() {
      const {data: resData} = await this.$http.get('rights/tree');
      // console.log(resData);
      const {data} = resData;
      this.treeData = data;
    },
    // 点击按钮，显示分配权限的对话框
    handleShowRightsDialog(role) {
      this.dialogVisible = true;
      // 获取当前角色权限的id
      // 遍历一级权限
      const arr = [];
      role.children.forEach((item1) => {
        arr.push(item1.id);
        // 遍历二级权限
        item1.children.forEach((item2) => {
          arr.push(item2.id);
          // 遍历三级权限
          item2.children.forEach((item3) => {
            arr.push(item3.id);
          });
        });
      });
      this.checkedList = arr;
    }
  }
};
</script>

<style>
.row-add {
  margin-top: 10px;
  margin-bottom: 10px;
}
.level1 {
  margin-bottom: 10px;
}
.level3 {
  margin-bottom: 5px;
  margin-right: 5px;
}
</style>
