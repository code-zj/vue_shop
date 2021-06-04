<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 列表区域 -->
      <el-table :data="orderList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column
          label="订单价格"
          prop="order_price"
          width="100px"
        ></el-table-column>
        <el-table-column label="是否付款" prop="order_pay" width="100px">
          <template slot-scope="scope">
            <el-tag type="danger" v-if="scope.row.order_pay === '0'"
              >未付款</el-tag
            >
            <el-tag type="success" v-else>已付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="是否发货"
          prop="is_send"
          width="100px"
        ></el-table-column>
        <el-table-column label="下单时间" prop="create_time" width="200px">
          <template slot-scope="scope">
            {{ scope.row.create_time | dataFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" prop="" width="150px">
          <template>
            <el-tooltip
              content="修改订单地址"
              placement="bottom"
              :enterable="false"
            >
              <el-button
                size="mini"
                icon="el-icon-edit"
                type="primary"
                @click="editAddress"
              ></el-button>
            </el-tooltip>
            <el-tooltip
              content="查看物流进度"
              placement="bottom"
              :enterable="false"
            >
              <el-button
                size="mini"
                icon="el-icon-location"
                type="success"
                @click="showProgress"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="10"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>

      <!-- 修改订单地址的对话框 -->
      <el-dialog
        title="修改地址"
        :visible.sync="editAddressVisible"
        width="50%"
        @close="editVisibleClosed"
      >
        <el-form
          :model="addressForm"
          :rules="addressFormRules"
          ref="addressFormRef"
          label-width="100px"
        >
          <el-form-item label="省市区/县" prop="address1">
            <el-cascader
              :options="cityData"
              v-model="addressForm.address1"
              :props="{ expandTrigger: 'hover' }"
            ></el-cascader>
          </el-form-item>
          <el-form-item label="详细地址" prop="address2">
            <el-input v-model="addressForm.address2"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="editAddressVisible = false">取 消</el-button>
          <el-button type="primary" @click="editAddressVisible = false"
            >确 定</el-button
          >
        </span>
      </el-dialog>

      <!-- 显示物流进度 -->
      <el-dialog title="提示" :visible.sync="progressVisible" width="50%">
        <span>这是一段信息</span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import cityData from './citydata'

export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      // 页数
      total: 0,
      orderList: [],
      // 控制修改订单地址的对话框的显示隐藏
      editAddressVisible: false,
      // 修改订单地址表单数据
      addressForm: {
        address1: '',
        address2: ''
      },
      addressFormRules: {
        address1: [
          { required: true, message: '请填写省市区县', trigger: 'blur' }
        ],
        address2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' }
        ]
      },
      cityData,
      // 物流进度对话框
      progressVisible: false
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    // 获取订单表数据
    async getOrderList() {
      const { data: res } = await this.$http.get('/orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        this.$message.error('获取订单表数据失败！')
      }
      this.total = res.data.total
      this.orderList = res.data.goods
      console.log(res)
    },
    // 监听 pagesize 的改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 监听 pagenum 的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 修改订单地址
    editAddress() {
      this.editAddressVisible = true
    },
    // 修改地址对话框关闭触发
    editVisibleClosed() {
      this.$refs.addressFormRef.resetFields()
    },
    // 点击显示物流进度
    async showProgress() {
      const { data: res } = await this.$http.get('/kuaidi/SF1333209036440')
      if (res.meta.status !== 200) {
        this.$message.error('获取物流数据失败!')
      }
      this.progressInfo = res.data
      console.log(res)
      this.progressVisible = true
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
</style>
